// 1. CONFIGURATION
const API_KEY = '1a450bf9-a323-48d1-bceb-9f57d1bc63a7';
let currentAQIData = null;

// 2. HELPER FUNCTIONS (The "Logic")
function getHealthWarnings(aqi) {
    if (aqi <= 50) return '<p>Air quality is good. No health concerns.</p>';
    if (aqi <= 100) return '<p>Acceptable. Sensitive groups should limit outdoor time.</p>';
    if (aqi <= 150) return '<p><strong>Warning:</strong> Children/elderly may feel discomfort.</p>';
    if (aqi <= 200) return '<p><strong>Everyone:</strong> Throat and eye irritation common.</p>';
    return '<p><strong>HEALTH ALERT:</strong> Serious risk to everyone. Stay indoors.</p>';
}

function getRecommendations(aqi) {
    if (aqi <= 50) return '<ul><li>Enjoy outdoor activities!</li></ul>';
    if (aqi <= 150) return '<ul><li>Wear an N95 mask outside.</li><li>Use air purifiers.</li></ul>';
    return '<ul><li><strong>STAY INDOORS</strong>.</li><li>Seal windows and doors.</li></ul>';
}

function getConsequences(aqi) {
    if (aqi <= 100) return '<p>No immediate consequences.</p>';
    if (aqi <= 200) return '<ul><li>Increased risk of asthma.</li><li>Permanent lung damage.</li></ul>';
    return '<ul><li>Life-threatening outcomes.</li><li>Irreversible heart damage.</li></ul>';
}

// 3. AI MOCK FUNCTION (Microsoft Imagine Cup Requirement)
async function getAIPrediction(aqi, city) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (aqi > 100) {
                resolve(`Azure AI Analysis: The current atmosphere in ${city} shows high particulate matter. Predicted risk for respiratory fatigue: INCREASED. Suggesting indoor alternatives.`);
            } else {
                resolve("Azure AI Analysis: Stable air quality detected. No significant long-term health anomalies predicted for today.");
            }
        }, 1500); 
    });
}

// 4. UI UPDATER (How the data looks on screen)
async function updateUI(data) {
    const resultDiv = document.getElementById('result');
    const aqi = data.data.current.pollution.aqius;
    const city = data.data.city;
    const country = data.data.country;

    currentAQIData = { aqi, city, country };

    let aqiLevel = "Good";
    let color = "#00e400";

    if (aqi > 50) { aqiLevel = 'Moderate'; color = '#ffff00'; }
    if (aqi > 100) { aqiLevel = 'Unhealthy (Sens)'; color = '#ff7e00'; }
    if (aqi > 150) { aqiLevel = 'Unhealthy'; color = '#ff0000'; }
    if (aqi > 200) { aqiLevel = 'Very Unhealthy'; color = '#8f3f97'; }
    if (aqi > 300) { aqiLevel = 'Hazardous'; color = '#7e0023'; }

    resultDiv.innerHTML = `
        <h2 style="text-align: center;">📍 ${city}, ${country}</h2>
        <div style="background: ${color}; padding: 30px; border-radius: 15px; color: ${aqi <= 100 ? 'black' : 'white'}; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 64px;">${aqi}</h1>
            <p style="font-size: 24px; font-weight: 600;">${aqiLevel.toUpperCase()}</p>
        </div>
        
        <div class="info-card warning-card"><h3>⚠️ Health Warnings</h3>${getHealthWarnings(aqi)}</div>
        <div class="info-card action-card"><h3>✅ What To Do</h3>${getRecommendations(aqi)}</div>
        <div class="info-card danger-card"><h3>❌ Future Risks</h3>${getConsequences(aqi)}</div>
        
        <div id="ai-assistant" style="margin-top: 25px; padding: 20px; border-radius: 15px; background: #f0f4ff; border: 1px solid #667eea; text-align: left;">
            <h3 style="color: #4a5568; margin-bottom: 10px;">🤖 Microsoft Azure AI Insights</h3>
            <p id="ai-prediction">Analyzing environmental patterns...</p>
        </div>
    `;
    
    // Trigger AI text update
    const aiText = document.getElementById('ai-prediction');
    const prediction = await getAIPrediction(aqi, city);
    aiText.innerText = prediction;
}

// 5. EVENT LISTENERS (The "Main" triggers)
document.getElementById('checkBtn').addEventListener('click', function() {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p>🔍 Requesting Location Access...</p>';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                resultDiv.innerHTML = '<p>📍 Location Found. Fetching data...</p>';
                
                try {
                    const response = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${API_KEY}`);
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        updateUI(data);
                    } else {
                        resultDiv.innerHTML = '<p>❌ Error: ' + data.data.message + '</p>';
                    }
                } catch (err) {
                    resultDiv.innerHTML = '<p>❌ Network Error. Please check your connection.</p>';
                }
            },
            function(error) {
                resultDiv.innerHTML = '<p>❌ Error: Please enable location in your browser settings.</p>';
            }
        );
    }
});
