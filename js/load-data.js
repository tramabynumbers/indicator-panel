/**
 * Using the appropriate data model to guide the loading of CSV data.
 */
var dataLoader={
    modelFilePath:"isdcovid_PB.json",// path to the data model file
    dataModel:{},
    data:[],// store the type {key:"",values:[]}

    init:async ()=>{
        let data=await dataLoader.loadAllData();
        return data;
    },

    loadCSVFile: async (key)=>{
        let d;
        await d3.csv("data/"+key+".csv").then(
            (data, error)=>{
                if (error) throw error;
                d=data;
            }
        );
        return d;
    },

    loadDataModel: async ()=>{
        let dm;
        await d3.json("model/"+dataLoader.modelFilePath).then(
            (data, error)=>{
                if (error) throw error;
                dm=data;
            }
        );
        return dm;
    },

    csvToJs: async(csv)=>{
        let data = [];
        await csv.forEach(
            (d)=>{
                if(d["geocode"] && d["value"])
                    data[d["geocode"]]=parseFloat(d["value"].replace(",","."));
                else
                    throw "There is something wrong with the csv data. Mandatory column name \"geocode\" and/or \"value\" is missing."
            }
        );
        return data;
    },

    loadAllData: async ()=>{
        let keys=[];
        await dataLoader.loadDataModel().then(
            (dm)=>{
                dataLoader.dataModel=dm;
                keys=dataLoader.getAllKeys(dm);
            }
        );

        let allData=[];
        let dataPromises=[];
        keys.forEach(
            (key)=>{
                const dataPromise = new Promise((resolve, reject) => {
                    dataLoader.loadCSVFile(key).then(
                        (csv)=>{
                            try {
                                dataLoader.csvToJs(csv).then(
                                    (d)=>{
                                        resolve({key:key,values:d});
                                    }
                                );
                            } catch (error) {
                                console.error(error+"\nCSV data file format error for ("+key+".csv)");
                                reject();
                            }
                        }
                    );
                });
                dataPromises.push(dataPromise);
            }
        );
        await Promise.all(dataPromises).then((d) => {
            allData.push(d);
        });
        return allData;
    },

    getAllKeys: (obj, parentKey)=>{
        let keys = [];
        for(let prop in obj){
            if(Object.prototype.toString.call(obj[prop])=="[object Array]" && obj[prop].length) {
                obj[prop].forEach(element => {
                    keys=keys.concat(dataLoader.getAllKeys(element, obj["key"]));
                });
            }else{
                if (prop=="key") {
                    keys.push((!parentKey?"":parentKey+"-")+obj[prop]);
                }
            }
        }
        return keys;
    }

};