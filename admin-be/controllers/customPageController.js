const { CustomPage, Theme } = require('../models');
const { Op } = require('sequelize');

function normalizeSchemaPayload(schema) {
  if (!schema) return {};
  if (schema.custom_page && typeof schema.custom_page === 'object') return schema;
  if (typeof schema === 'object') return { custom_page: schema };
  return {};
}

function buildAllowedTagSet(customPageSchema) {
  const allowed = new Set();
  if (!customPageSchema || typeof customPageSchema !== 'object') return allowed;
  for (const [pageName, tags] of Object.entries(customPageSchema)) {
    if (!tags || typeof tags !== 'object') continue;
    for (const tagName of Object.keys(tags)) {
      allowed.add(`${pageName}-${tagName}`);
    }
  }
  return allowed;
}

function normalizeTagKey(tagKey) {
  return String(tagKey || '')
    .trim()
    .toLowerCase()
    .replace(/\d+$/g, '');
}

function resolveSchemaTagForItem(item, customPageSchema) {
  if (!item?.page || !item?.tag) return { matched: null, reason: 'invalid_item' };
  const pageSchema = customPageSchema?.[item.page];
  if (!pageSchema || typeof pageSchema !== 'object') {
    return { matched: null, reason: 'page_not_found' };
  }

  const pagePrefix = `${item.page}-`;
  const incomingTagKey = String(item.tag).startsWith(pagePrefix)
    ? String(item.tag).slice(pagePrefix.length)
    : String(item.tag).split('-').slice(1).join('-');

  if (pageSchema[incomingTagKey]) {
    return { matched: `${item.page}-${incomingTagKey}`, reason: 'exact' };
  }

  const normalizedIncoming = normalizeTagKey(incomingTagKey);
  const candidates = Object.keys(pageSchema).filter(
    schemaTagKey => normalizeTagKey(schemaTagKey) === normalizedIncoming
  );

  if (candidates.length === 1) {
    return { matched: `${item.page}-${candidates[0]}`, reason: 'normalized_single' };
  }

  if (candidates.length > 1) {
    return { matched: null, reason: 'ambiguous', candidates };
  }

  return { matched: null, reason: 'not_found' };
}

exports.getAll = async (req, res) => {
  try {
    const where = {};

    if (req.query.tag) {
      where.tag = req.query.tag;
    }

    if (req.query.parent_id === 'null') {
      where.parent_id = null;
    } else if (req.query.parent_id) {
      where.parent_id = req.query.parent_id;
    }

    const data = await CustomPage.findAll({ where });

    // Parse items if necessary
    const parsedData = data.map(item => {
      let parsedItems = null;
      try {
        parsedItems = typeof item.items === 'string' ? JSON.parse(item.items) : item.items;
      } catch (err) {
        console.warn(` Gagal parsing items untuk ID ${item.id}`);
      }

      return {
        ...item.toJSON(),
        items: parsedItems,
      };
    });

    res.json(parsedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.items && typeof body.items === 'object') {
      body.items = JSON.stringify(body.items);
    }

    const newContent = await CustomPage.create(body);
    res.status(201).json(newContent);
  } catch (error) {
    console.error('CREATE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const content = await CustomPage.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Custom Page not found' });
    }

    let parsedItems = null;
    try {
      parsedItems = typeof content.items === 'string' ? JSON.parse(content.items) : content.items;
    } catch (err) {
      console.warn(' Gagal parsing items di GET BY ID:', err.message);
    }

    res.json({
      ...content.toJSON(),
      items: parsedItems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    if (body.items && typeof body.items === 'object') {
      body.items = JSON.stringify(body.items)
    }    

    // console.log(' Incoming Update Payload:', body);

    const [updated] = await CustomPage.update(body, { where: { id } });

    if (updated === 0) {
      return res.status(404).json({ message: 'Custom Page not found' });
    }

    const updatedContent = await CustomPage.findByPk(id);
    let parsedItems = null;
    try {
      parsedItems = typeof updatedContent.items === 'string'
        ? JSON.parse(updatedContent.items)
        : updatedContent.items;
    } catch (err) {
      console.warn(' Gagal parsing items di UPDATE:', err.message);
    }

    res.status(200).json({
      ...updatedContent.toJSON(),
      items: parsedItems,
    });
  } catch (err) {
    console.error(' Update Failed:', err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const deleted = await CustomPage.destroy({ where: { id: req.params.id } });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Custom Page not found' });
    }

    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteByTag = async (req, res) => {
  try {
    const { tag } = req.params  // ← ini yang benar
    if (!tag) return res.status(400).json({ message: 'Tag is required' })

    const deleted = await CustomPage.destroy({ where: { tag } })

    if (deleted === 0) {
      return res.status(404).json({ message: `Tag "${tag}" tidak ditemukan.` })
    }

    res.json({ message: `Tag "${tag}" berhasil dihapus.` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal menghapus tag.' })
  }
}

exports.getByPage = async (req, res) => {
  try {
    const page = req.query.page;
    const theme_id = req.query.theme_id;

    if (!page) return res.status(400).json({ message: 'Page is required' });

    const where = {
      page: page
    };
    
    if (theme_id !== undefined) {
      where.theme_id = theme_id;
    }
    

    const items = await CustomPage.findAll({ where });

    const result = {};

    items.forEach(item => {
      const tagParts = item.tag.split('-');
      const key = tagParts.slice(1).join('-'); 

      let parsed;
      try {
        parsed = typeof item.items === 'string' ? JSON.parse(item.items) : item.items;
      } catch (e) {
        console.warn(` Gagal parse items untuk ${item.tag}:`, e.message);
        return;
      }
      if (result[key]) {
       
        if (!Array.isArray(result[key])) {
          result[key] = [result[key]];
        }
        result[key].push(parsed);
      } else {
        result[key] = parsed;
      }
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error(' Gagal load custom page:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================== EXPORT ====================== //
exports.exportByPage = async (req, res) => {
  try {
    const { page, theme_id, tags } = req.query;

    if (!page) {
      return res.status(400).json({ success: false, message: 'Parameter "page" is required' });
    }

    const where = { page };
    if (theme_id !== undefined && theme_id !== '') {
      where.theme_id = theme_id;
    }
    if (tags !== undefined && tags !== '') {
      const tagList = String(tags)
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      if (tagList.length > 0) {
        where.tag = { [Op.in]: tagList };
      }
    }

    const items = await CustomPage.findAll({ where, order: [['id', 'ASC']] });

    let exportSchema = null;
    if (theme_id !== undefined && theme_id !== '') {
      const theme = await Theme.findByPk(theme_id);
      if (theme?.schema?.custom_page?.[page]) {
        const pageSchema = theme.schema.custom_page[page];
        if (where.tag?.[Op.in]?.length) {
          const allowedTagKeys = new Set(
            where.tag[Op.in]
              .filter(tag => String(tag).startsWith(`${page}-`))
              .map(tag => String(tag).slice(`${page}-`.length))
          );
          const filtered = {};
          for (const [tagKey, definition] of Object.entries(pageSchema)) {
            if (allowedTagKeys.has(tagKey)) filtered[tagKey] = definition;
          }
          exportSchema = { custom_page: { [page]: filtered } };
        } else {
          exportSchema = { custom_page: { [page]: pageSchema } };
        }
      }
    }

    // Strip id, created_at, updated_at agar aman untuk import antar environment
    const exportData = items.map(item => {
      const json = item.toJSON();
      let parsedItems;
      try {
        parsedItems = typeof json.items === 'string' ? JSON.parse(json.items) : json.items;
      } catch (e) {
        parsedItems = json.items;
      }

      return {
        title: json.title,
        description: json.description,
        tag: json.tag,
        page: json.page,
        theme_id: json.theme_id,
        image: json.image,
        is_active: json.is_active,
        parent_id: json.parent_id,
        items: parsedItems,
      };
    });

    res.json({
      success: true,
      meta: {
        page,
        theme_id: theme_id || null,
        tags: where.tag?.[Op.in] || null,
        count: exportData.length,
        exported_at: new Date().toISOString(),
        source: 'meolody_cms'
      },
      schema: exportSchema,
      data: exportData
    });
  } catch (err) {
    console.error('Export custom pages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ====================== IMPORT (UPSERT) ====================== //
exports.importBulk = async (req, res) => {
  try {
    const { data = [], meta = {}, schema, theme_id } = req.body;

    const hasSchema = !!schema;
    const hasData = Array.isArray(data) && data.length > 0;

    if (!hasSchema && !hasData) {
      return res.status(400).json({ success: false, message: 'File import harus memiliki "schema" dan/atau "data".' });
    }

    const warnings = [];
    const schemaInput = normalizeSchemaPayload(schema);
    const targetThemeId = theme_id || meta.theme_id || (data.find(i => i?.theme_id)?.theme_id || null);

    let schemaMerged = false;
    let schemaMergedPages = 0;
    let schemaMergedTags = 0;
    let effectiveCustomPageSchema = {};

    if (targetThemeId) {
      const theme = await Theme.findByPk(targetThemeId);
      if (!theme) {
        warnings.push({ type: 'schema', message: `Theme ID ${targetThemeId} tidak ditemukan. Import schema dilewati.` });
      } else {
        const existingSchema = theme.schema && typeof theme.schema === 'object' ? theme.schema : {};
        const existingCustomPage = existingSchema.custom_page && typeof existingSchema.custom_page === 'object'
          ? existingSchema.custom_page
          : {};

        if (hasSchema) {
          const incomingCustomPage = schemaInput.custom_page && typeof schemaInput.custom_page === 'object'
            ? schemaInput.custom_page
            : {};

          const mergedCustomPage = { ...existingCustomPage };

          for (const [pageName, tags] of Object.entries(incomingCustomPage)) {
            if (!tags || typeof tags !== 'object') continue;
            schemaMergedPages++;
            if (!mergedCustomPage[pageName] || typeof mergedCustomPage[pageName] !== 'object') {
              mergedCustomPage[pageName] = {};
            }
            for (const [tagName, tagDef] of Object.entries(tags)) {
              mergedCustomPage[pageName][tagName] = tagDef;
              schemaMergedTags++;
            }
          }

          await theme.update({
            schema: {
              ...existingSchema,
              custom_page: mergedCustomPage
            }
          });

          schemaMerged = true;
          effectiveCustomPageSchema = mergedCustomPage;
        } else {
          effectiveCustomPageSchema = existingCustomPage;
        }
      }
    } else {
      warnings.push({ type: 'schema', message: 'theme_id tidak ditemukan. Import schema dilewati.' });
    }

    if (!Object.keys(effectiveCustomPageSchema).length && hasSchema && schemaInput.custom_page) {
      effectiveCustomPageSchema = schemaInput.custom_page;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];
    const allowedTags = buildAllowedTagSet(effectiveCustomPageSchema);

    for (const item of (Array.isArray(data) ? data : [])) {
      try {
        if (!item.tag || !item.page || item.items === undefined || item.items === null) {
          errors.push({ tag: item.tag, error: 'tag dan page wajib diisi' });
          continue;
        }

        let effectiveTag = item.tag;
        if (allowedTags.size > 0 && !allowedTags.has(item.tag)) {
          const resolved = resolveSchemaTagForItem(item, effectiveCustomPageSchema);
          if (resolved.matched) {
            effectiveTag = resolved.matched;
            warnings.push({
              type: 'data_map',
              from_tag: item.tag,
              to_tag: effectiveTag,
              message: `Tag "${item.tag}" dimap ke "${effectiveTag}" mengikuti schema aktif.`
            });
          } else {
            skipped++;
            const ambiguousPart = resolved.reason === 'ambiguous'
              ? ` Kandidat: ${(resolved.candidates || []).join(', ')}`
              : '';
            warnings.push({
              type: 'data',
              tag: item.tag,
              message: `Tag "${item.tag}" tidak ada di schema aktif, item di-skip.${ambiguousPart}`
            });
            continue;
          }
        }

        // Cari existing berdasarkan tag + page + theme_id (upsert by tag)
        const whereClause = {
          tag: effectiveTag,
          page: item.page,
        };
        const resolvedThemeId = item.theme_id ?? targetThemeId ?? null;
        if (resolvedThemeId !== null) {
          whereClause.theme_id = resolvedThemeId;
        }

        const existing = await CustomPage.findOne({ where: whereClause });

        // Siapkan payload
        const payload = {
          title: item.title || 'Untitled',
          description: item.description || '',
          tag: effectiveTag,
          page: item.page,
          theme_id: resolvedThemeId,
          image: item.image || null,
          is_active: item.is_active !== undefined ? item.is_active : true,
          parent_id: item.parent_id || null,
          items: typeof item.items === 'object' ? JSON.stringify(item.items) : item.items,
          created_by: item.created_by || 'import',
          updated_by: 'import',
        };

        if (existing) {
          await CustomPage.update(payload, { where: { id: existing.id } });
          updated++;
        } else {
          await CustomPage.create(payload);
          created++;
        }
      } catch (itemErr) {
        errors.push({ tag: item.tag, error: itemErr.message });
      }
    }

    res.json({
      success: true,
      imported: created + updated,
      schema_merged: schemaMerged,
      schema_merged_pages: schemaMergedPages,
      schema_merged_tags: schemaMergedTags,
      theme_id: targetThemeId || null,
      created,
      updated,
      skipped,
      warnings: warnings.length > 0 ? warnings : undefined,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Import custom pages error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
