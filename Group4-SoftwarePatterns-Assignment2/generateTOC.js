"use strict";

//by Eamon Nerbonne
function getSectionScope(htmlElement) {
    return htmlElement.parentNode.closest("html, article, section");
}

function getArticleScope(htmlElement) {
    return htmlElement.closest("html, article");
}

function getSectionHeading(htmlSection) {
    return Array.from(htmlSection.querySelectorAll("h1")).filter(header => getSectionScope(header) === htmlSection)[0];
}

const data = Symbol("my-data");
const getData = node => node[data] || (node[data] = {});


function createSectionToc(arrChildren) {
    var tableEl = document.createElement("table");
    for (var i = 0; i < arrChildren.length; ++i) {
        var thisSection = arrChildren[i];
		var sectionData = getData(thisSection);
        var sectionHeading = getSectionHeading(thisSection);
        var sectionNumber = sectionData.fullpath;
        if (!sectionHeading || !sectionHeading)
            throw "Cannot process section (no section h1):" + thisSection.textContent;
        var headingString = sectionHeading.textContent;

        var numEl = document.createElement("td");
        numEl.appendChild(document.createTextNode(sectionNumber));

        var linkEl = document.createElement("a");
        linkEl.setAttribute("href", "#" + thisSection.getAttribute("id"));
        linkEl.appendChild(document.createTextNode(headingString));
        var contentEl = document.createElement("td");
        contentEl.appendChild(linkEl);



        if (sectionData.childSections && sectionData.childSections.length > 0)
            contentEl.appendChild(createSectionToc(sectionData.childSections));
        var rowEl = document.createElement("tr");
        rowEl.appendChild(numEl);
        rowEl.appendChild(contentEl);
        tableEl.appendChild(rowEl);
    }

    return tableEl;
}
let sectionIdx =0;
for(const thisSection of document.querySelectorAll("section")) {
	var thisSectionData = getData(thisSection);
	if (thisSection.getAttribute("id") === null) thisSection.setAttribute("id", "autoSecNum" + sectionIdx);

	var parentSection = getSectionScope(thisSection);
	var parentSectionData = getData(parentSection);
	
	if (parentSectionData.childSections === undefined) parentSectionData.childSections = [];

	parentSectionData.childSections.push(thisSection);
	thisSectionData.sectionNumber = parentSectionData.childSections.length;
	thisSectionData.parentSection = parent;

	thisSectionData.fullpath = (parentSectionData.fullpath ? parentSectionData.fullpath + "." : "") + thisSectionData.sectionNumber;
	var sectionHeader = getSectionHeading(thisSection);

	sectionHeader.setAttribute("data-fullpath", thisSectionData.fullpath);
	sectionIdx++;
}

for(const el of document.querySelectorAll(".generateTableOfContents")) {
	var scope = getSectionScope(el);
	var scopeData = getData(scope);

	var arrChildren = scopeData.childSections;
	if (arrChildren && arrChildren.length > 0) {
		el.appendChild(createSectionToc(arrChildren));
	}
}

let figIdx = 0;
for(const thisFigure of document.querySelectorAll("figure")) {
	if (thisFigure.getAttribute("id") === null) thisFigure.setAttribute("id", "autoFigNum" + figIdx);

	var parentArticle = getArticleScope(thisFigure);
	var parentArticleData = getData(parentArticle);

	if (parentArticleData.figureCounter === undefined) parentArticleData.figureCounter = 0;
	parentArticleData.figureCounter++;
    thisFigure.setAttribute("data-figureNumber", parentArticleData.figureCounter);
	for(const caption of thisFigure.querySelectorAll("figcaption")) {
        caption.setAttribute("data-figureNumber", parentArticleData.figureCounter);
	}
	figIdx++;
}

let citationIdx = 0;
for(const thisCitation of document.querySelectorAll("aside.bibliography li")) {
	if (thisCitation.getAttribute("id") === null) thisCitation.setAttribute("id", "autoCiteNum" + citationIdx);

	var parentArticle = getArticleScope(thisCitation);
	var parentArticleData = parentArticle.dataset;
	if (parentArticleData.citationCounter === undefined) parentArticleData.citationCounter = 0;
	parentArticleData.citationCounter++;
	thisCitation.setAttribute("data-citationNumber", "" + parentArticleData.citationCounter);
	citationIdx++;
}


for(const thisInnerLink of document.querySelectorAll("a[href^='#']")) {
	if (thisInnerLink.textContent == '[ref]') {
		var idOfRef = thisInnerLink.getAttribute("href").substring(1);
		var referencedElement = document.getElementById(idOfRef);
		//might be a section, figure, equation or bibliography element
		if (referencedElement == null) {
			thisInnerLink.addClass('ref-error');
			thisInnerLink.setAttribute('data-err-reason', "Invalid reference");
		} else if (referencedElement.nodeName === 'SECTION') {
			var heading = getSectionHeading(referencedElement);
			var headingString = heading.textContent;
			if (!thisInnerLink.getAttribute("title")) thisInnerLink.setAttribute("title", headingString.trim());
			thisInnerLink.textContent = 'Section ' + referencedElement.dataset.fullpath;
		} else if (referencedElement.nodeName === 'LI' && referencedElement.closest("aside.bibliography")) {
			thisInnerLink.textContent = '[' + referencedElement.getAttribute('data-citationNumber') + ']';
			//in bib
		} else if (referencedElement.nodeName === 'FIGURE') {
			//figref
			thisInnerLink.textContent = 'Figure ' + referencedElement.getAttribute('data-figureNumber') + '';
		} else if (referencedElement.nodeName === 'SCRIPT') {
			//in bib
			throw "Formula cross referencing not yet implemented";
		} else {
			thisInnerLink.addClass('ref-error');
			thisInnerLink.setAttribute('data-err-reason', "referenced element unrecognized");
		}
	}
}


      
