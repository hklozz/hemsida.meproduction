/* Custom preview panes for Decap CMS — shows a live visual approximation of
   the actual card on the site while you fill in the form, instead of just a
   list of text fields. Applies to the "Nyheter" and "Gänget" tabs. */

var NewsPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var image = entry.getIn(["data", "image"]);
    var imgSrc = image ? this.props.getAsset(image).toString() : "";
    var title = entry.getIn(["data", "title"]) || "(ingen titel än)";
    var text = entry.getIn(["data", "text"]) || "";
    var date = entry.getIn(["data", "date"]);
    var dateLabel = date ? new Date(date).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" }) : "";

    return h(
      "div",
      {},
      h("div", { className: "preview-hint" }, "Så här kommer nyhetskortet se ut på sajten:"),
      h(
        "div",
        { className: "preview-news-card" },
        h("div", { className: "preview-news-img", style: { backgroundImage: imgSrc ? "url(" + imgSrc + ")" : "none" } }),
        h(
          "div",
          { className: "preview-news-body" },
          dateLabel ? h("div", { className: "preview-news-date" }, dateLabel) : null,
          h("h3", {}, title),
          h("p", {}, text)
        )
      )
    );
  },
});

var TeamPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var photo = entry.getIn(["data", "photo"]);
    var imgSrc = photo ? this.props.getAsset(photo).toString() : "";
    var name = entry.getIn(["data", "name"]) || "(inget namn än)";
    var city = entry.getIn(["data", "city"]) || "goteborg";
    var cityLabels = { goteborg: "Göteborg", stockholm: "Stockholm", "goteborg stockholm": "Göteborg & Stockholm" };
    var cityLabel = cityLabels[city] || city;
    var email = entry.getIn(["data", "email"]);
    var phone = entry.getIn(["data", "phone"]);

    return h(
      "div",
      {},
      h("div", { className: "preview-hint" }, "Så här kommer kortet se ut på Gänget-sidan:"),
      h(
        "div",
        { className: "preview-team-card" },
        h("div", { className: "preview-team-img", style: { backgroundImage: imgSrc ? "url(" + imgSrc + ")" : "none" } }),
        h(
          "div",
          { className: "preview-team-body" },
          h("h3", {}, name),
          h("span", { className: "preview-city-badge" }, cityLabel),
          email ? h("a", {}, email) : null,
          phone ? h("span", { className: "preview-phone" }, phone) : null
        )
      )
    );
  },
});

CMS.registerPreviewStyle("/admin/preview.css");
CMS.registerPreviewTemplate("news", NewsPreview);
CMS.registerPreviewTemplate("team", TeamPreview);
