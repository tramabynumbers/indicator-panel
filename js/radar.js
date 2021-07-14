var radar=radar||{};
var radar={
    margin:{top: 30, right: 20, bottom: 20, left: 25},
    width:0,
    height:0,

    init:()=>{
        radar.width=Math.min(250, window.innerWidth - 10) - radar.margin.left - radar.margin.right,
        radar.height=Math.min(radar.width, window.innerHeight - radar.margin.top - radar.margin.bottom - 20),
        radar.color=d3v3.scale.ordinal().range(["#60d8ff"]),
        radar.chartOptions={
            w: radar.width,
            h: radar.height,
            margin: radar.margin,
            maxValue: 0.5,
            levels: 5,
            roundStrokes: true,
            color: radar.color
        }
    },

    /**
     * Call function to draw the Radar chart
     * @param data, the array with input radar data.
     */
    draw:(data)=>{
        RadarChart(".radar-chart", [data], radar.chartOptions);
    }
};
radar.init();