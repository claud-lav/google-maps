// js Code voor maps wanneer je een maar 1 marker nodig hebt.
import { Loader } from "@googlemaps/js-api-loader";

const mapElement = document.querySelector('#map-contact'); // Id van de div waar je map in moet

if (mapElement) {
    function createMap(lat, lng) {
        const loader = new Loader ({
            apiKey: "API-KEY", // Voeg hier de key van je Google API
            version: "weekly",
            libraries: ["marker"]
        });
    
        const mapOptions = {
            center: {lat: lat, lng: lng},
            zoom: 12, // hoe hard de map moet inzoomen 
            mapId: "MAP_ID", // ID van de map management waar de juiste styling is aan toegevoegd 
            mapTypeControl: false,
            streetViewControl: false,
        };
    
        loader 
            .importLibrary('maps', 'marker')
            .then(() => {
                return loader.importLibrary('marker')
            })
            .then (() => {
                if (!google.maps.marker || !google.maps.marker.AdvancedMarkerElement) {
                    console.error("AdvancedMarkerElement is not available.")
                }

                const { Map } = google.maps;
                const { AdvancedMarkerElement } = google.maps.marker;

                const map = new Map(document.getElementById("map-contact"), mapOptions);

                const customMarker = document.createElement('div');
                customMarker.className = "custom-marker";
                customMarker.innerHTML = `<div class="map-marker"></div>`; // div van de marker die je customized  
                const marker = new AdvancedMarkerElement({
                    position: {lat: lat , lng: lng},
                    map: map,
                    content: customMarker,
                    title: "our location"
                });
            })
            .catch((e) => {
                console.error("Error loading the Google Maps library:", e);
            })
    };

    async function fetchCoordinates() {
        // Query van je data 
        const query = `
            query CompanyLocation {
                entries(section: "contactInfo") {
                    ... on contactInfo_Entry {
                    f_address {
                        latitude
                        longitude
                    }
                    }
                }
                }
        `;
    
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer token` // token van je aangemaakte schema in Craft
            },
            body: JSON.stringify({ query })
        });
    
        const result = await response.json();
        return result.data.globalSet.f_address[0]; // In je data gaan waar de lat en lan staan. Pas aan naar eigen field names 
    };
    
    fetchCoordinates().then(address => {
        createMap(parseFloat(address.latitude), parseFloat(address.longitude));
    });

};

