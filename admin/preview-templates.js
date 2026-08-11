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

/* Helpers shared by the sections below. */
function val(entry, path, fallback) {
  var v = entry.getIn(["data"].concat(path));
  return v === undefined || v === null || v === "" ? (fallback || "") : v;
}
function list(entry, path) {
  var v = entry.getIn(["data"].concat(path));
  return v ? v.toJS() : [];
}

var HomePreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var getAsset = this.props.getAsset;
    var v = function (path, fb) { return val(entry, path, fb); };
    var services = list(entry, ["services", "items"]);
    var numbers = list(entry, ["numbers", "items"]);
    var caseItems = list(entry, ["case", "items"]);
    var faqItems = list(entry, ["faq", "items"]);

    return h(
      "div",
      { className: "preview-home" },

      h("div", { className: "preview-hint" }, "Så här kommer startsidan att se ut, sektion för sektion:"),

      // Hero
      h(
        "div",
        { className: "preview-hero-box" },
        h("span", { className: "preview-pill" }, v(["hero", "tag"], "Tagg-text")),
        h(
          "h1",
          { className: "preview-hero-heading" },
          v(["hero", "heading"], "Rubrik"),
          " ",
          h("em", {}, v(["hero", "headingEm"], ""))
        ),
        h("p", { className: "preview-hero-sub" }, v(["hero", "sub"], "")),
        h(
          "div",
          { className: "preview-btn-row" },
          h("span", { className: "preview-btn-primary" }, v(["hero", "btnPrimary"], "Knapp 1")),
          h("span", { className: "preview-btn-ghost" }, v(["hero", "btnGhost"], "Knapp 2"))
        )
      ),

      // Services
      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, v(["services", "label"], "TJÄNSTER")),
        h("h2", { className: "preview-section-heading" }, v(["services", "heading"], "")),
        h("p", { className: "preview-section-intro" }, v(["services", "intro"], "")),
        h(
          "div",
          { className: "preview-services-grid" },
          services.map(function (item, i) {
            return h(
              "div",
              { className: "preview-service-card", key: i },
              h("h4", {}, item.title || "(titel saknas)"),
              h("p", {}, item.desc || "")
            );
          })
        )
      ),

      // Numbers
      h(
        "div",
        { className: "preview-section preview-section-dark" },
        h("div", { className: "preview-section-label" }, v(["numbers", "label"], "SIFFROR")),
        h(
          "div",
          { className: "preview-numbers-grid" },
          numbers.map(function (item, i) {
            return h(
              "div",
              { className: "preview-number", key: i },
              h("div", { className: "preview-number-value" }, item.value || "–"),
              h("div", { className: "preview-number-label" }, item.label || "")
            );
          })
        )
      ),

      // About
      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, v(["about", "label"], "OM OSS")),
        h(
          "h2",
          { className: "preview-section-heading" },
          v(["about", "headingLine1"], ""),
          " ",
          v(["about", "headingLine2"], "")
        ),
        h("p", { className: "preview-section-intro" }, v(["about", "paragraph1"], "")),
        h("p", { className: "preview-section-intro" }, v(["about", "paragraph2"], ""))
      ),

      // Case
      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, v(["case", "label"], "CASE")),
        h("h2", { className: "preview-section-heading" }, v(["case", "heading"], "")),
        h(
          "div",
          { className: "preview-case-grid" },
          caseItems.map(function (item, i) {
            var imgSrc = item.image ? getAsset(item.image).toString() : "";
            return h(
              "div",
              { className: "preview-case-card", key: i },
              h("div", { className: "preview-case-img", style: { backgroundImage: imgSrc ? "url(" + imgSrc + ")" : "none" } }),
              h(
                "div",
                { className: "preview-case-overlay" },
                h("span", { className: "preview-case-tag" }, item.tag || ""),
                h("h3", {}, item.title || "(titel saknas)"),
                h("p", {}, item.description || "")
              )
            );
          })
        )
      ),

      // Team teaser
      h(
        "div",
        { className: "preview-section preview-section-dark" },
        h("div", { className: "preview-section-label" }, v(["team", "label"], "GÄNGET")),
        h(
          "h2",
          { className: "preview-section-heading" },
          v(["team", "headingLine1"], ""),
          " ",
          v(["team", "headingLine2"], ""),
          " ",
          h("em", {}, v(["team", "headingEm"], ""))
        ),
        h("p", { className: "preview-section-intro" }, v(["team", "paragraph"], ""))
      ),

      // Clients
      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, v(["clients", "label"], "KUNDER")),
        h("h2", { className: "preview-section-heading" }, v(["clients", "heading"], "")),
        h("p", { className: "preview-section-intro" }, v(["clients", "intro"], ""))
      ),

      // Contact
      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, v(["contact", "label"], "KONTAKT")),
        h("h2", { className: "preview-section-heading" }, v(["contact", "heading"], "")),
        h("p", { className: "preview-section-intro" }, v(["contact", "paragraph"], ""))
      ),

      // FAQ
      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, v(["faq", "label"], "VANLIGA FRÅGOR")),
        h("h2", { className: "preview-section-heading" }, v(["faq", "heading"], "")),
        h(
          "div",
          { className: "preview-faq-list" },
          faqItems.map(function (item, i) {
            return h(
              "div",
              { className: "preview-faq-item", key: i },
              h("div", { className: "preview-faq-q" }, item.q || "(fråga saknas)"),
              h("div", { className: "preview-faq-a" }, item.a || "")
            );
          })
        )
      )
    );
  },
});

var SeoPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var pages = list(entry, ["pages"]);

    return h(
      "div",
      {},
      h("div", { className: "preview-hint" }, "Så här kan sidorna se ut i Google-sökresultat:"),
      h(
        "div",
        { className: "preview-google-list" },
        pages.map(function (page, i) {
          return h(
            "div",
            { className: "preview-google-card", key: i },
            h("div", { className: "preview-google-label" }, page.label || "(sida)"),
            h("div", { className: "preview-google-url" }, "meproduction.se" + (page.id === "index" ? "" : "/" + page.id)),
            h("div", { className: "preview-google-title" }, page.title || "(ingen titel än)"),
            h("div", { className: "preview-google-desc" }, page.description || "(ingen meta-beskrivning än)")
          );
        })
      )
    );
  },
});

var SitePreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var v = function (path, fb) { return val(entry, path, fb); };

    return h(
      "div",
      {},
      h("div", { className: "preview-hint" }, "Logotyp & sidfot:"),
      h(
        "div",
        { className: "preview-site-card" },
        h("div", { className: "preview-site-logo" }, "me", h("span", {}, "production")),
        h("div", { className: "preview-site-meta" }, "Alt-text (för skärmläsare & Google): “" + v(["logoAlt"], "") + "”"),
        h("div", { className: "preview-site-footer" }, v(["footerTagline"], ""))
      )
    );
  },
});

CMS.registerPreviewStyle("/admin/preview.css");
CMS.registerPreviewTemplate("news", NewsPreview);
CMS.registerPreviewTemplate("team", TeamPreview);
CMS.registerPreviewTemplate("home", HomePreview);
CMS.registerPreviewTemplate("seo", SeoPreview);
CMS.registerPreviewTemplate("site", SitePreview);
