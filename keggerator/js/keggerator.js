/**
 *
 * Keggerator - image annotator
 * Jeremy Espino MD MS
 * Copyright 2013
 *
 */
var keggerator = function () {

    var pathwayId = {};
    var selectList = {};
    var data = [];
    var dataShown = [];
    var pathwayImageWidth, pathwayImageHeight;
    var acetate = {};
    var phenotypeGeneIdMap = {};
    var phenotypeBorderSize = 80;

    function initCanvas(imageDiv) {

        imageDiv.append("<svg id='acetate'></svg>");

    }

    function updateCanvas(pathway_id, pathwayType) {

        var imgSrc = "http://rest.kegg.jp/get/" + pathway_id + "/image";
        acetate = d3.select("#acetate");

        // retrieve image size
        drawPathway(imgSrc);
    }

    function drawRects() {
        var selectorWidth = 46;
        var selectorHeight = 17;
        var selectorVerticalPad = 10;
        var selectorHorizontalPad = 5;

        acetate = d3.select("#acetate");

        acetate.selectAll(".gene").data(dataShown).exit().transition()
            .attr("y", 1000)
            .duration(1000)
            .remove();

        // draw rects
        acetate.selectAll(".gene").data(dataShown).enter().append("rect")
            .classed("gene", true)
            .attr("x", function (d, i) {
                return (d.x - Math.floor(d.width / 2))
            })
            .attr("y", function (d, i) {
                return (d.y - Math.floor(d.height / 2))
            })
            .attr("width", function (d) {
                return d.width
            })
            .attr("height", function (d) {
                return d.height
            })
            .style("fill", "red")
            .style("opacity", 0.5);

        acetate.selectAll(".phenotype").data(phenotypeGeneIdMap).enter().append("rect")
            .classed("phenotype", true)
            .attr("x", function (d, i) {
                return (pathwayImageWidth + selectorHorizontalPad);
            })
            .attr("y", function (d, i) {
                return ((selectorHeight + selectorVerticalPad) * i);
            })
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", function (d) {
                return selectorWidth;
            })
            .attr("height", function (d) {
                return selectorHeight;
            })
            .style("fill", function (d) {
                return d.color;
            })
            .style("opacity", 0.5);

    }

    function drawPathway(imgSrc) {

        var myImage = new Image();
        myImage.name = imgSrc;
        myImage.onload = function () {
            pathwayImageHeight = this.height;
            pathwayImageWidth = this.width;
            console.log(pathwayImageHeight + "," + pathwayImageWidth);

            // add pathway image as background
            acetate.append("svg:image")
                .attr("id", "pathwayImage")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", pathwayImageWidth)
                .attr("height", pathwayImageHeight)
                .attr("style", "padding: 0px 0px 0px 0px;")
                .attr("xlink:href", imgSrc);

            // set canvas size to image size
            acetate
                .attr("width", pathwayImageWidth + phenotypeBorderSize)
                .attr("height", pathwayImageHeight);

            drawRects();


        };
        myImage.src = imgSrc;

    }


    function init(imageDiv, select_list) {
        selectList = select_list;

        initCanvas(imageDiv);
    }


    function clearHighlights() {
        acetate.selectAll(".gene").transition()
            .attr("y", 1000)
            .duration(1000)
            .remove();


        //acetate.selectAll("rect").data([]).exit().remove();

    }

    function highlight() {

        var elements = selectList.val();

        dataShown = [];
        data.forEach(function (d) {
            if (elements.indexOf(d.graph_id) > -1) {
                dataShown.push(d);
            }
        });
        drawRects();
    }

    function setPathwayId(pathway_id, phenotype_gene_id_map) {
        pathwayId = pathway_id;
        phenotypeGeneIdMap = phenotype_gene_id_map;

        // if kegg pathway type
        // fill in select element options
        $.get("http://rest.kegg.jp/get/" + pathway_id + "/kgml", function (xml) {
            var kgmlJson = $.xml2json(xml);

            // update the select list options
            selectList.empty(); // remove old options
            $.each(kgmlJson.entry, function () {
                // only use rectangles
                if (this.graphics.type == "rectangle") {
                    selectList.append($("<option></option>").attr("value", this.name).text(this.graphics.name));
                    // populate data array
                    data.push({"label": this.graphics.name, "x": this.graphics.x, "y": this.graphics.y, "width": this.graphics.width, "height": this.graphics.height, "graph_id": this.name});
                }
            });

            // update image
            updateCanvas(pathway_id, pathwayType);

            // process phenogene map
            // add colors to each phenotype
            // add x,y locations for each phenotype
            // add x,y locations and colors for each gene
            if (phenotypeGeneIdMap !== undefined) {
                var palette = colorbrewer.RdYlGn['11'];
                for (var i = 0; i < phenotypeGeneIdMap.length; i++) {
                    phenotypeGeneIdMap[i].color = palette[i];
                    for (var gene in phenotypeGeneIdMap[i].genes) {

                        if (phenotypeGeneIdMap[i].genes.hasOwnProperty(gene)) {

                            phenotypeGeneIdMap[i].genes[gene].x = 0;
                            phenotypeGeneIdMap[i].genes[gene].y = 0;
                            phenotypeGeneIdMap[i].genes[gene].width = 0;
                            phenotypeGeneIdMap[i].genes[gene].height = 0;


                            console.log(gene + ":" + phenotypeGeneIdMap[i].genes[gene]);
                        }

                    }

                }
            }

        });

        // if wikipathway type

    }

    function setPhenotypeGeneIdMap(m) {
        // [ { "phenotype_id" : {
        //      "label" : "label",
        //      "genes" : { "gene1":{} , "gene2""{} }
        //      }
        //    }
        //  ]

        phenotypeGeneIdMap = m;

    }

    function highlightPhenotype(phenotypeId) {

        // swap the order of drawn elements

        // redraw

    }

// public methods and vars
    return {
        init: init,
        setPathwayId: setPathwayId,
        setPhenotypeGeneIdMap: setPhenotypeGeneIdMap,
        highlightPhenotype: highlightPhenotype,

        highlight: highlight,
        clearHighlights: clearHighlights
    };

}
    ();


