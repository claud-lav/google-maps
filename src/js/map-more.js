// js Code voor maps wanneer je meerdere markers nodig hebt. Kaart zal automatisch centraal staan.
import { Loader } from "@googlemaps/js-api-loader";

const mapElement = document.querySelector('#map-references'); // Id van de div waar je map in moet

if (mapElement) {
    function createMap(locations) {
        const loader = new Loader ({
            apiKey: "API-KEY", // Voeg hier de key van je Google API
            version: "weekly",
            libraries: ["marker"]
        });
    
        const mapOptions = {
            center: {lat: 50.97377306791086, lng: 2.9431934028415068},
            zoom: 12, // hoe hard de map moet inzoomen 
            mapId: "7e1c4c732de8a407", // ID van de map management waar de juiste styling is aan toegevoegd 
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
                    console.error("AdvancedMarkerElement is not available.");
                    return;
                }

                const { Map } = google.maps;
                const { AdvancedMarkerElement } = google.maps.marker;

                const map = new Map(document.getElementById("map-references"), mapOptions);

                locations.forEach(location => {
                    const customMarker = document.createElement('div');
                    customMarker.className = "custom-marker";
                    customMarker.innerHTML = `
                        <div class="map-marker--${ location.type }"></div>
                    `; // div van de marker die je customized 

                    const marker = new AdvancedMarkerElement({
                        position: {lat: location.lat , lng: location.lng},
                        map: map,
                        content: customMarker,
                        title: location.title || "Location"
                    });

                    marker.location = location;
                    markers.push(marker);

                    bounds.extend({ lat: location.lat, lng: location.lng });
                });

                map.fitBounds(bounds);

                google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
                    if (map.getZoom() > 12) {
                        map.setZoom(12);
                    }
                });

            })
            .catch((e) => {
                console.error("Error loading the Google Maps library:", e);
            })
    };

    async function fetchCoordinates() {
        // Query van je data 
        const query = `
            query ReferenceQuery {
                referencesEntries {
                    ... on reference_Entry {
                    title
                    f_projectType
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
                'Authorization': `Bearer vEfoyX4J9_WaDtRBrsgxS3G3RXVghTj0` // token van je aangemaakte schema in Craft
            },
            body: JSON.stringify({ query })
        });
    
        const result = await response.json();
        console.log(result)
        return result.data.referencesEntries.map(entry => ({
            lat: parseFloat(entry.f_address[0].latitude),
            lng: parseFloat(entry.f_address[0].longitude),
            title: entry.title,
            type: entry.f_projectType,
        }));
    };
    
    fetchCoordinates().then(locations => {
        if (locations.length > 0) {
            createMap(locations);
        } else {
            console.error("No location found");
        }
    });

};

