/**
 * Build the map componente based on Leaflet.
 */
var mainMap={
    map:null,// reference to leaflet map component
    geojson:null,// reference to geojson raw data loaded from file
    mainLayer: null,// reference to main leaflet layer based on geojson raw data.
    defaultZoomLevel:8,// the zoom level used to reset view map
    info:L.control(),
    observer:null,
    selectedFeature:null,

    init:(selectedDataSource)=>{
        return new rxjs.Observable(
            (observer)=>{
                mainMap.observer=observer;
                mainMap.fetchConf(selectedDataSource);
                mainMap.fetchData(selectedDataSource);
            },
            ()=>{
                // on error, set .... as default
                console.log("Missing error handler");
            }
        );
    },

    createMap:()=>{
        if (mainMap.map) {
            mainMap.map.off();
            mainMap.map.remove();
        }
        mainMap.map = L.map('mainmap').setView([-23, -45], mainMap.defaultZoomLevel);

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/light-v9',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(mainMap.map);

        mainMap.addInfoControl();
        mainMap.addAttribution();
    },

    /**
     * Update the indicator value in the geojson data and recreate the Layer.
     * @param {Array} values, An array with the geocode and new values for the "indicator" attribute
     */
    updateMainLayer:(csv)=>{
        mainMap.geojson.features.forEach(
            (f)=>{
                let geocode=f.properties["gc"];
                f.properties["indicator"]=csv.values[geocode];
            }
        );
        mainMap.createMainLayer(mainMap.geojson);
    },

    // control that shows state info on hover
    addInfoControl:()=>{
        mainMap.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        mainMap.info.update = function (props) {
            this._div.innerHTML = (props ?
                '<b>' + props.nm + '</b><br />' + props.indicator.toFixed(2) + ' índice (entre 0 e 1)'
                : 'passe o mause sobre os municípios');
        };

        mainMap.info.addTo(mainMap.map);
    },


    // get color depending on population indicator value
    // getColor:(d)=>{
    //     return d > 0.8 ? '#800026' :
    //             d > 0.7  ? '#BD0026' :
    //             d > 0.6  ? '#E31A1C' :
    //             d > 0.5  ? '#FC4E2A' :
    //             d > 0.4  ? '#FD8D3C' :
    //             d > 0.3  ? '#FEB24C' :
    //             d > 0.1  ? '#FED976' :
    //                         '#FFEDA0';
    // },

    getLegendColor:(value)=>{
        /** 
         * Using the length of the color list from the conf file
         * as the number of classes in the legend
         */
        let len = mainMap.legend.colors.length,
        index = parseInt(value*len);
        index = index>=len ? len-1 : index;
        return mainMap.legend.colors[index];
    },

    style:(feature)=>{
        return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 1,
            fillColor: mainMap.getLegendColor(feature.properties.indicator)
        };
    },

    highlightFeature:(e)=>{
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 1
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        mainMap.info.update(layer.feature.properties);
    },

    resetHighlight:(e)=>{
        mainMap.mainLayer.resetStyle(e.target);
        mainMap.info.update();
    },

    resetHighlightAll:()=>{
        mainMap.mainLayer.eachLayer(
            (layer)=>{
                if(layer!=mainMap.selectedFeature) {
                    mainMap.mainLayer.resetStyle(layer);
                }
            }
        );
    },

    zoomToFeature:(e)=>{
        mainMap.map.fitBounds(e.target.getBounds());
    },

    onClick:(e)=>{
        //mainMap.zoomToFeature(e);
        mainMap.selectedFeature=e.target;
        mainMap.highlightFeature(e);
        mainMap.resetHighlightAll();
    },

    onEachFeature:(feature, layer)=>{
        layer.on({
            // mouseover: mainMap.highlightFeature,
            // mouseout: mainMap.resetHighlight,
            click: mainMap.onClick
        });
    },

    fetchData(selectedDataSource){
        fetch(selectedDataSource.geoFilePath)
        .then(
            (response)=>{
                // on sucess
                response.json()
                .then(
                    (data)=>{
                        mainMap.geojson = data;
                        mainMap.createMap();
                        mainMap.createMainLayer(data);
                        // mainMap.addLegend();
                        // on sucess
                        if(mainMap.observer) mainMap.observer.next();
                    }
                );
            },
            ()=>{
                // on reject
                // mainMap.observer.
                console.log("Falhou ao ler o geojson. Mapa incompleto.");
            },
        );
    },

    fetchConf(selectedDataSource){
        fetch(selectedDataSource.mapLegendFilePath)
        .then(
            (response)=>{
                // on sucess
                response.json()
                .then(
                    (legend)=>{
                        mainMap.legend = legend;
                    }
                );
            },
            ()=>{
                // on reject
                console.log("Falhou ao ler o arquivo de configuração de legendas do mapa.");
            }
        );
    },

    createMainLayer: (data)=>{
        if(mainMap.mainLayer) mainMap.mainLayer.removeFrom(mainMap.map);
        mainMap.mainLayer = L.geoJson(data, {
            style: mainMap.style,
            onEachFeature: mainMap.onEachFeature
        }).addTo(mainMap.map);

        mainMap.map.setView(mainMap.mainLayer.getBounds().getCenter(),mainMap.defaultZoomLevel);
    },

    addAttribution:()=>{
        mainMap.map.attributionControl.addAttribution('IVM-COVID-19 &copy; <a href="http://www.inpe.br/">INPE</a>');
    },

    addLegend:()=>{
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
                labels = [],
                from, to;

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + mainMap.getLegendColor(from + 0.01) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(mainMap.map);
    }
};