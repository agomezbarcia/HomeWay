<template>
    <div class="weather-widget" v-if="weatherData" :style="`height:${screenHeight - 400}px; width:100%`">
        <div v-if="loading" class="loading">Cargando...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else class="weather-content">
            <div class="weather-main">
                <img :src="iconUrl" alt="Icono del clima" class="weather-icon">
                <div class="temperature">{{ Math.round(weatherData.main.temp) }}°{{ unitsSymbol }}</div>
            </div>
            <div class="weather-details my-3">
                <div class="description">
                    <i :class="descriptionIconClass"></i> {{ capitalizedDescription }}
                </div>
                <div class="humidity my-2">
                    <i class="fas fa-tint"></i> Humedad: {{ weatherData.main.humidity }}%
                </div>
                <div class="wind my-2">
                    <i class="fas fa-wind"></i> Viento: {{ weatherData.wind.speed }} m/s
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
    name: 'WeatherWidget',
    props: {
        apikey: {
            type: String,
            required: true
        },
        lat: {
            type: Number,
            required: true
        },
        lon: {
            type: Number,
            required: true
        },
        units: {
            type: String,
            default: 'metric', // metric, imperial, o standard
            validator: (value) => ['metric', 'imperial', 'standard'].includes(value)
        },
        lang: {
            type: String,
            default: 'es'
        }
    },
    data() {
        return {
            weatherData: null,
            loading: true,
            error: null,
            screenHeight: 0
        };
    },
    computed: {
        iconUrl() {
            return this.weatherData
                ? `https://openweathermap.org/img/wn/${this.weatherData.weather[0].icon}@2x.png`
                : '';
        },
        unitsSymbol() {
            return this.units === 'metric' ? 'C' : this.units === 'imperial' ? 'F' : 'K';
        },
        capitalizedDescription() {
            return this.weatherData.weather[0].description.charAt(0).toUpperCase() +
                this.weatherData.weather[0].description.slice(1);
        },
        descriptionIconClass() {
            const description = this.weatherData.weather[0].main.toLowerCase();
            if (description.includes('clear')) {
                return 'fas fa-sun';
            } else if (description.includes('clouds')) {
                return 'fas fa-cloud';
            } else if (description.includes('rain')) {
                return 'fas fa-cloud-showers-heavy';
            } else if (description.includes('snow')) {
                return 'fas fa-snowflake';
            } else if (description.includes('thunderstorm')) {
                return 'fas fa-bolt';
            }
            return 'fas fa-smog'; // Default icon if none matches
        }
    },
    mounted() {
        this.fetchWeatherData();
        this.screenHeight = window.innerHeight;
        if (this.screenHeight > 700) {
            this.screenHeight = 700; // Set a minimum height
        }
    },
    watch: {
        lat() {
            this.fetchWeatherData();
        },
        lon() {
            this.fetchWeatherData();
        }
    },
    methods: {
        async fetchWeatherData() {
            try {
                this.loading = true;
                this.error = null;

                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather`, {
                    params: {
                        lat: this.lat,
                        lon: this.lon,
                        appid: this.apikey,
                        units: this.units,
                        lang: this.lang
                    }
                }
                );

                this.weatherData = response.data;
            } catch (error) {
                this.error = 'Error al obtener datos del clima';
                console.error('Error fetching weather:', error);
            } finally {
                this.loading = false;
            }
        }
    }
});
</script>

<style scoped>
.weather-widget {
    padding: 1.5rem;
    background: linear-gradient(135deg, #19222c, #222e3c, #1e3c72, #2a5298);
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    color: white;
    font-family: 'Poppins', sans-serif;
    text-align: center;
    transition: transform 0.3s ease-in-out;
}

.weather-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.weather-main {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.weather-icon {
    width: 80px;
    height: 80px;
}

.temperature {
    font-size: 2.5rem;
    font-weight: bold;
}

.weather-details {
    line-height: 1.6;
}

.description {
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: capitalize;
}

.humidity, .wind {
    font-size: 1rem;
}

.loading,
.error {
    color: #ffcc00;
    font-style: italic;
    font-size: 1.2rem;
}

.error {
    color: #ff4444;
}
</style>