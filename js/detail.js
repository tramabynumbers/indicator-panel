var detail={
    selectedIndicator:null,// the selected indicator
    selectedGeom:null,// the selected geometry

    /**
     * Define the indicator selected in the tree view
     * @param {string} indicator, the key of the selected node in the tree view
     */
    setSelectedIndicator:(indicator)=>{
        detail.selectedIndicator=(indicator.key)?(indicator.key):(null);
        return detail;
    },

    /**
     * Define the geometry selected in the map.
     * @param {geomInfo} geomInfo, the informations of the selected geometry in the map.
     */
    setSelectedGeom:(geomInfo)=>{
        detail.selectedGeom=geomInfo;
        return detail;
    },

    /**
     * Update the details on the dashboard
     * 
     */
    updatePanel:()=>{
        let detailHeader="Descrição do indicador está ausente";
        let children="A seleção não possui indicadores derivados";
        if(detail.selectedIndicator){
            if(treeview.getSelected().description)
                detailHeader=treeview.getSelected().description;

            if(treeview.getSelected().externalfile) {
                $('#pdf-link').html("Abrir arquivo PDF");
                $('#pdf-link').attr('style','display:inline');
                $('#pdf-nolink').attr('style','display:none');
            }else {
                $('#pdf-link').attr('style','display:none');
                $('#pdf-nolink').html("PDF ausente");
                $('#pdf-nolink').attr('style','display:inline');
            }
            if(treeview.hasChildren())
                children=detail.getChildrenList(treeview.getChildren());
        }

        if(detail.selectedGeom){
            detailHeader=detailHeader+' <b>['+treeview.getSelected().key+'='+
            ((detail.selectedGeom.indicator)?(detail.selectedGeom.indicator.toFixed(2)):('indefinido'))+']</b>'+
            ' para o município <b>'+detail.selectedGeom.nm+'</b>';
            if(treeview.hasChildren())
                radar.draw(detail.getChildrenData(treeview.getChildren()));
            else
                radar.clean();
        }

        $('#detail-description').html(detailHeader);
        $('#detail-children').html(children);
    },

    /**
     * Get the HTML list of the child nodes of the selected node.
     * @param {Array} childNodes The child nodes of the selected node
     * @returns The HTML list representation
     */
    getChildrenList:(childNodes)=>{
        let l="<span>Lista dos nós derivados</span><ul>";
        childNodes.forEach(
            (n)=>{
                l=l+"<li>["+n.key+"] - "+n.description+"</li>";
            }
        );
        return l+"</ul>";
    },

    getChildrenData:(childNodes)=>{
        let d=[];
        childNodes.forEach(
            (n)=>{
                d.push({axis:n.key,value:(dataLoader.getIndicatorValuebyKeyToSelectedGeom(n.key) || 0)});
            }
        );
        return d;
    },

    /**
     * Open a modal window to display a PDF file
     */
     displayPdf:()=>{
        let path=dataSourceSelector.getSelected().pdfPath;// the base path to read pdf files
        let file=treeview.getSelected().externalfile; // the name of pdf file
        $('#pdfviewer').html(treeview.getSelected().description);
        $('#pdffile').height(0);
        $('#display-pdf').modal('show');
        window.setTimeout(
            ()=>{
                let height=parseInt((window.innerHeight-$('.modal-dialog').height())*0.95);
                $('#pdffile').height(height);
                $('#pdffile').attr('src',path+file);
            },200
        );
    }
};