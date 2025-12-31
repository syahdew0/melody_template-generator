<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Under Construction</title>
    <style>
        body {
            background: #f2f2f2;
            color: #333;
            font-family: Arial, sans-serif;
            text-align: center;
            padding-top: 10%;
        }
        .container {
            background: #fff;
            display: inline-block;
            padding: 40px 60px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
        }
        p {
            font-size: 1.2em;
            color: #666;
        }
        .svg-anim {
            width: 220px;
            height: 180px;
            margin-bottom: 20px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
    </style>
    <script async
    src="https://qi2c5y3mof4edbkxtk2vzipd.agents.do-ai.run/static/chatbot/widget.js"
    data-agent-id="68f5f278-9837-11f0-b074-4e013e2ddde4"
    data-chatbot-id="sn-TLxbQSDyKq0J_9kV5labMlnR3lD00"
    data-name="senyaman-living-bot Chatbot"
    data-primary-color="#031B4E"
    data-secondary-color="#E5E8ED"
    data-button-background-color="#0061EB"
    data-starting-message="Hello! How can I help you today?"
    data-logo="/static/chatbot/icons/default-agent.svg">
    </script>
</head>
<body>
    <!-- SVG Construction Animation -->
    <svg class="svg-anim" viewBox="0 0 220 180">
        <!-- Ground -->
        <rect x="0" y="160" width="220" height="20" fill="#bdbdbd"/>
        <!-- Sign -->
        <g>
            <rect x="60" y="60" width="100" height="40" rx="8" fill="#ffeb3b" stroke="#fbc02d" stroke-width="4"/>
            <text x="110" y="85" text-anchor="middle" font-size="18" font-family="Arial" fill="#333" font-weight="bold">UNDER</text>
            <text x="110" y="105" text-anchor="middle" font-size="18" font-family="Arial" fill="#333" font-weight="bold">CONSTRUCTION</text>
        </g>
        <!-- Worker Body -->
        <g>
            <ellipse cx="50" cy="140" rx="15" ry="20" fill="#90caf9"/>
            <!-- Head -->
            <circle cx="50" cy="120" r="10" fill="#ffe082" stroke="#fbc02d" stroke-width="2"/>
            <!-- Helmet -->
            <ellipse cx="50" cy="116" rx="11" ry="6" fill="#ff9800" stroke="#f57c00" stroke-width="2"/>
            <rect x="39" y="116" width="22" height="5" rx="2" fill="#ff9800"/>
            <!-- Arm with hammer -->
            <g>
                <rect id="arm" x="60" y="130" width="22" height="6" rx="3" fill="#ffe082" transform="rotate(-20 60 133)"/>
                <!-- Hammer -->
                <rect x="80" y="132" width="10" height="3" rx="1.5" fill="#616161"/>
                <rect x="89" y="130" width="3" height="7" rx="1.5" fill="#424242"/>
            </g>
        </g>
        <!-- Simple animation using JS -->
        <script type="application/ecmascript"><![CDATA[
            const svg = document.querySelector('.svg-anim');
            const arm = svg.getElementById('arm');
            let angle = -20, dir = 1;
            function animateArm() {
                angle += dir * 1.5;
                if (angle > 10 || angle < -20) dir *= -1;
                arm.setAttribute('transform', `rotate(${angle} 60 133)`);
                requestAnimationFrame(animateArm);
            }
            animateArm();
        ]]></script>
    </svg>
    <div class="container">
        <h1>Under Construction</h1>
        <p>We're working hard to bring you a better experience.<br>
        Please check back soon!</p>
    </div>
</body>
</html>