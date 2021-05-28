var utils={
    mainRowOffset:0.6,// default offset to define height for main row

    /**
     * Apply a percentage of the total height to components in main row where is the map component.
     * @param {double} offset, a percentage value between 0 and 1, default 0.6(60%)
     */
    setMainRowHeight:(offset)=>{
        if(!offset) offset=utils.mainRowOffset;
        let mainRowHeight=window.innerHeight*offset;
        $('#mainmap').height(mainRowHeight);
        $('#treeview').height(mainRowHeight);
    },

    /**
     * 
     * @param {*} msg The string message
     * @param {*} aggregate if message should be aggregate with inner content of alert element
     */
    displayError:(msg, aggregate)=>{
        let text="";
        $('#errors').attr('style','display:'+(msg?'block':'none')+';');
        if(aggregate) {
            let t=(($('#msg-errors').html().trim()!="")?("<br/>"):(""));
            text=$('#msg-errors').html().trim()+t;
        }
        $('#msg-errors').html(text + (msg?msg:'&nbsp;'));
    }
};