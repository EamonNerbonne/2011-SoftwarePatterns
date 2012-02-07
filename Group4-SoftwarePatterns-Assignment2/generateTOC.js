//by Eamon Nerbonne
function getSectionScope(jqElement) {
    return jqElement.parents().filter("html, article, section").first();
}

function getSectionHeading(jqSection) {
    return jqSection.find("h1").filter(function () {
        return $(this).parents().filter("html, article, section").first()[0] === jqSection[0];
    }).first();
}

function createSectionToc(arrChildren) {
    var tableEl = document.createElement("table");
    for (var i = 0; i < arrChildren.length; ++i) {
        var jqSection = arrChildren[i];
        var sectionData = jqSection.data();
        var sectionHeading = getSectionHeading(jqSection);
        var sectionNumber = sectionData.fullpath;
        if (!sectionHeading || !sectionHeading.length)
            throw "Cannot process section (no section h1):" + jqSection.text();
        var headingString = sectionHeading[0].textContent;

        var numEl = document.createElement("td");
        numEl.appendChild(document.createTextNode(sectionNumber));

        var linkEl = document.createElement("a");
        linkEl.setAttribute("href", "#" + jqSection.attr("id"));
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

$(function () {

    $("section").each(function (index) {
        var thisSection = $(this);
        var thisSectionData = thisSection.data();
        if (thisSection.attr("id") === undefined) thisSection.attr("id", "autoSecNum" + index);

        var parentSection = getSectionScope(thisSection);
        var parentSectionData = parentSection.data();
        if (parentSectionData.childSections === undefined) parentSectionData.childSections = [];

        parentSectionData.childSections.push(thisSection);
        thisSectionData.sectionNumber = parentSectionData.childSections.length;
        thisSectionData.parentSection = parent;

        thisSectionData.fullpath = (parentSectionData.fullpath ? parentSectionData.fullpath + "." : "") + thisSectionData.sectionNumber;
        var sectionHeader = getSectionHeading(thisSection);

        sectionHeader.attr("data-fullpath", thisSectionData.fullpath);
    });

    $("div.generateTableOfContents").each(function () {
        var scope = getSectionScope($(this));

        var scopeData = scope.data();
        var arrChildren = scopeData.childSections;
        if (arrChildren && arrChildren.length > 0) {
            $(this).append(createSectionToc(arrChildren));
        }
    });

    $("a.ref").filter('[href^="#"]').each(function () {
        var idref = $(this).attr("href").substring(1);
        var section = $(document.getElementById(idref));
        var heading = getSectionHeading(section);
        var headingString = heading[0].textContent;
        if (!$(this).attr("title")) $(this).attr("title", headingString.trim());
        var linkContent = $(this).html();
        var newContent = linkContent.replace(/\[[^]]*\]/g, section.data().fullpath);
        $(this).html(newContent);
    });

});
      
