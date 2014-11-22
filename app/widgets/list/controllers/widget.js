var args = arguments[0] || {};
var data = [];

var getStream = args.getStream;
var showImage = args.showImage || null;
var getMore = args.getMore || null;

function onClickLink(e) {
    //Ti.API.info(e.url);
    if (e.url) {
        if (e.url.substr(0, 10) == "pusteblume") {
            // handle hashtags
            Ti.API.info("hashtag");
        } else {
            // external link
            Ti.Platform.openURL(e.url);
        }
    } else {
        // click the textfield but not a link
        //Ti.API.info("show comments");
        onClickItem({
            source: {
                name: "",
                row: {
                    id: e.source.rowID
                }
            }
        });
    }
}

$.setData = function(d) {
    data = d;
    var mainData = [];

    for (var i = 0; i < data.length; ++i) {
        var row = Ti.UI.createTableViewRow({
            height: Ti.UI.SIZE
        });

        var img = $.UI.create('ImageView', {
            classes: ["img_author"],
            image: data[i].icon
        });

        var lbl_author = $.UI.create('Label', {
            classes: ["txt_author"],
            text: data[i].author
        });

        var view_content = Ti.UI.createView({
            height: Ti.UI.SIZE,
            left: 0,
            right: 0,
            top: 34,
            layout: "vertical"
        });

        var lbl_text = $.UI.create('Label', {
            classes: ["lbl_text"],
            html: Alloy.Globals.replaceText(data[i].text),
            top: 0,
            height: Ti.UI.SIZE
        });


        var img_post = null;
        if (data[i].photo !== null && data[i].photo !== "") {
            img_post = Ti.UI.createImageView({
                imageBig: data[i].photoBig,
                image: data[i].photo,
                width: 50,
                height: 50,
                top: 0,
                right: 14,
                borderWidth: 1,
                borderColor: "#444"
            });

            function onClickImage(e) {
                e.bubbles = false;
                e.cancelBubble = true;
                if (showImage)
                    showImage(e.source.imageBig);
            }

            img_post.addEventListener("click", onClickImage);
        }

        var pubimg = "";
        var pubtxt = "public";
        if (!data[i].isPublic) {
            pubimg = "";
            pubtxt = "private";
        }

        var img_public = Ti.UI.createLabel({
            text: pubimg,
            left: 6,
            width: 10,
            height: 10,
            top: 70,
            font: {
                fontFamily: "FontAwesome",
                fontSize: 10
            }
        });
        var lbl_public = $.UI.create('Label', {
            classes: ["txt_small"],
            text: pubtxt,
            top: img_public.top - 4,
            left: 20,
            width: 35,
            textAlign: "left"
        });

        pubimg = null;
        pubtxt = null;


        var lbl_date = $.UI.create('Label', {
            classes: ["txt_date"],
            text: data[i].date,
            top: lbl_author.top + 1
        });

        view_content.add(lbl_text);

        row.add(img);
        row.add(lbl_author);
        row.add(lbl_date);
        row.add(view_content);

        if (data[i].type != "comments") {

            var img_likes = Ti.UI.createLabel({
                text: "",
                left: img_public.left,
                width: 12,
                height: 10,
                top: img_public.top + 20,
                font: {
                    fontFamily: "FontAwesome",
                    fontSize: 10
                }
            });

            var lbl_likes = $.UI.create('Label', {
                classes: ["txt_small"],
                text: data[i].like_count,
                top: img_likes.top - 4,
                left: lbl_public.left,
                width: 20,
                textAlign: "left"
            });

            var img_comments = Ti.UI.createLabel({
                text: "",
                width: 10,
                height: 10,
                top: img_likes.top + 20,
                left: img_public.left,
                font: {
                    fontFamily: "FontAwesome",
                    fontSize: 10
                }
            });

            var lbl_comments = $.UI.create('Label', {
                classes: ["txt_small"],
                text: data[i].comment_count,
                top: img_comments.top - 4,
                left: lbl_public.left,
                width: 20,
                textAlign: "left"
            });



            if (img_post !== null)
                view_content.add(img_post);


            var spacer = Ti.UI.createView({
                left: 0,
                top: 0,
                height: 125,
                width: 1,
                touchEnabled: false
            });

            row.add(img_comments);
            row.add(lbl_comments);
            row.add(img_public);
            row.add(lbl_public);
            row.add(img_likes);
            row.add(lbl_likes);
            row.add(spacer);
        }

        row.id = i;


        if (data.append===true){
            // append rows
            $.tbl.appendRow(row);
        } else {
            // add to array
            mainData.push(row);
        }
    }

    if (mainData.length>0) {
        // set data if array is not empty
        $.tbl.data = mainData;
    }
    mainData = null;
};

$.appendData = function(d) {
    // add elements to table
    d["append"] = true;
    this.setData(d);
};

function onShowMore(e) {
    // fold in/out the selected row
    if ($.tbl.data[0].rows[e.source.rowID].height != e.source.fullHeight) {
        $.tbl.data[0].rows[e.source.rowID].height = e.source.fullHeight;
        $.tbl.updateRow(e.source.rowID, $.tbl.data[0].rows[e.source.rowID]);
    } else {
        $.tbl.data[0].rows[e.source.rowID].height = 160;
        $.tbl.updateRow(e.source.rowID, $.tbl.data[0].rows[e.source.rowID]);
    }
}

function onClickItem(e) {
    // clicked an item
    if (e.source.name != "more") {
        if (e.row || e.source.row) {
            var id = null;
            if (e.row) {
                id = e.row.id;
            } else if (e.source.row) {
                id = e.source.row.id;
            }
            if (id !== null) {
                var cont = Alloy.createController("comments", {
                    id: data[id].id,
                    data: data[id],
                    refesh: getStream
                }).getView();
                cont.open();
            }
        }
    }
}

function onScroll(e) {
    if (e.firstVisibleItem > e.totalItemCount - 10) {

        $.btn_more.show();
    }
}

function onClickMore(e) {
    $.btn_more.hide();
    if (getMore) {
        getMore();
    }
}

if (args.click) {
    // show refresh for normal list first
    $.btn_more.addEventListener("click", onClickMore);
}
$.tbl.addEventListener("click", onClickItem);
$.tbl.addEventListener("scroll", onScroll);
