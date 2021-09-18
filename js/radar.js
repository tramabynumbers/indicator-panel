var radar=radar||{};
var radar={

    init:()=>{
        // reference values
        radar.margin={top: 30, right: 35, bottom: 30, left: 35};
        radar.width=280;
        radar.height=280;
        // adjust to actual values based on actual browser dimensions
        radar.width=Math.min(radar.width, $('.radar-chart').innerWidth()) - radar.margin.left - radar.margin.right,
        radar.height=Math.min(radar.height, $('.row.detail-body').innerHeight()) - radar.margin.top - radar.margin.bottom -5,
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
    },

    clean:()=>{
        d3v3.select(".radar-chart").select("svg").remove();
    }
};