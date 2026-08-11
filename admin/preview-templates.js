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

// Shared by the Göteborg- and Stockholm-sida tabs — same shape of content.
var CityPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var v = function (path, fb) { return val(entry, path, fb); };

    return h(
      "div",
      { className: "preview-home" },
      h("div", { className: "preview-hint" }, "Så här kommer sidan att se ut, sektion för sektion:"),

      h(
        "div",
        { className: "preview-hero-box" },
        h("span", { className: "preview-pill" }, v(["hero", "locationLabel"], "")),
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
          h("span", { className: "preview-btn-primary" }, v(["hero", "btnPrimary"], "")),
          h("span", { className: "preview-btn-ghost" }, v(["hero", "btnGhost"], ""))
        )
      ),

      h(
        "div",
        { className: "preview-section preview-section-dark" },
        h("div", { className: "preview-section-label" }, "📍 " + v(["address", "line"], "")),
        h("p", { className: "preview-hero-sub", style: { marginBottom: 0 } }, v(["address", "area"], ""))
      ),

      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, v(["intro", "label1"], "")),
        h("h2", { className: "preview-section-heading" }, v(["intro", "heading1Line1"], ""), " ", v(["intro", "heading1Line2"], "")),
        h("p", { className: "preview-section-intro" }, v(["intro", "paragraph1"], ""))
      ),

      h(
        "div",
        { className: "preview-section preview-section-dark" },
        h("div", { className: "preview-section-label" }, v(["intro", "label2"], "")),
        h("h2", { className: "preview-section-heading" }, v(["intro", "heading2Line1"], ""), " ", v(["intro", "heading2Line2"], "")),
        h("p", { className: "preview-section-intro" }, v(["intro", "paragraph2"], ""))
      ),

      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, "Hitta hit"),
        h("h2", { className: "preview-section-heading" }, v(["map", "heading"], "")),
        h("p", { className: "preview-section-intro" }, v(["map", "address"], ""), ", ", v(["map", "postal"], "")),
        h("p", { className: "preview-section-intro" }, v(["map", "officeTitle"], ""), " · ", v(["map", "phone"], ""), " · ", v(["map", "email"], ""))
      ),

      h(
        "div",
        { className: "preview-section preview-section-dark" },
        h("div", { className: "preview-section-label" }, v(["team", "label"], "")),
        h("h2", { className: "preview-section-heading" }, v(["team", "headingLine1"], ""), " ", v(["team", "headingLine2"], "")),
        h("p", { className: "preview-section-intro" }, v(["team", "sub"], ""))
      ),

      h(
        "div",
        { className: "preview-section" },
        h("h2", { className: "preview-section-heading" }, v(["cta", "heading"], ""), " ", h("em", {}, v(["cta", "headingEm"], ""))),
        h("p", { className: "preview-section-intro" }, v(["cta", "paragraph"], "")),
        h("span", { className: "preview-btn-primary", style: { background: "#F2C840", color: "#1a1a1a" } }, v(["cta", "btnLabel"], ""))
      )
    );
  },
});

var HallbarhetPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var v = function (path, fb) { return val(entry, path, fb); };
    var pillars = list(entry, ["pillars"]);
    var caseRows = list(entry, ["caseRows"]);
    var stats = list(entry, ["stats"]);
    var getAsset = this.props.getAsset;

    return h(
      "div",
      { className: "preview-home" },
      h("div", { className: "preview-hint" }, "Så här kommer Hållbarhet-sidan att se ut:"),

      h(
        "div",
        { className: "preview-hero-box" },
        h("span", { className: "preview-pill" }, v(["hero", "label"], "")),
        h("h1", { className: "preview-hero-heading" }, v(["hero", "heading"], ""), " Vi tar ", h("em", {}, v(["hero", "headingEm"], ""))),
        h("p", { className: "preview-hero-sub" }, v(["hero", "sub"], ""))
      ),

      h(
        "div",
        { className: "preview-section" },
        h("div", { className: "preview-section-label" }, v(["intro", "label"], "")),
        h("h2", { className: "preview-section-heading" }, v(["intro", "heading"], "")),
        h("p", { className: "preview-section-intro" }, v(["intro", "paragraph1"], "")),
        h("p", { className: "preview-section-intro" }, v(["intro", "paragraph2"], "")),
        h("p", { className: "preview-section-intro" }, v(["intro", "paragraph3"], ""))
      ),

      h(
        "div",
        { className: "preview-section preview-section-dark" },
        h("h2", { className: "preview-section-heading" }, v(["pillarsHeading"], "")),
        h(
          "div",
          { className: "preview-services-grid" },
          pillars.map(function (p, i) {
            return h(
              "div",
              { className: "preview-service-card", key: i },
              h("div", { className: "preview-section-label" }, p.num || ""),
              h("h4", {}, p.title || ""),
              h("p", {}, p.desc || "")
            );
          })
        )
      ),

      caseRows.map(function (row, i) {
        var imgSrc = row.image ? getAsset(row.image).toString() : "";
        return h(
          "div",
          { className: "preview-case-card", key: i, style: { maxWidth: "none", marginTop: "4px" } },
          h("div", { className: "preview-case-img", style: { backgroundImage: imgSrc ? "url(" + imgSrc + ")" : "none" } }),
          h(
            "div",
            { className: "preview-case-overlay" },
            h("span", { className: "preview-case-tag" }, row.tag || ""),
            h("h3", {}, row.heading || ""),
            h("p", {}, row.paragraph || "")
          )
        );
      }),

      h(
        "div",
        { className: "preview-numbers-grid", style: { background: "#F2C840", padding: "20px", borderRadius: "8px", marginTop: "4px" } },
        stats.map(function (s, i) {
          return h(
            "div",
            { className: "preview-number", key: i },
            h("div", { className: "preview-number-value", style: { color: "#1a1a1a" } }, s.value || ""),
            h("div", { className: "preview-number-label", style: { color: "rgba(0,0,0,0.5)" } }, s.label || "")
          );
        })
      ),

      h(
        "div",
        { className: "preview-section" },
        h("h2", { className: "preview-section-heading" }, v(["cta", "heading"], ""), " ", h("em", {}, v(["cta", "headingEm"], ""))),
        h("p", { className: "preview-section-intro" }, v(["cta", "paragraph"], "")),
        h("span", { className: "preview-btn-primary", style: { background: "#F2C840", color: "#1a1a1a" } }, v(["cta", "btnLabel"], ""))
      )
    );
  },
});

var CasePagePreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var getAsset = this.props.getAsset;
    var heroImage = entry.getIn(["data", "heroImage"]);
    var heroSrc = heroImage ? getAsset(heroImage).toString() : "";
    var deliverables = list(entry, ["deliverables"]);
    var gallery = list(entry, ["gallery"]);
    var v = function (path, fb) { return val(entry, path, fb); };

    return h(
      "div",
      { className: "preview-home" },
      h("div", { className: "preview-hint" }, "Så här kommer case-sidan att se ut:"),

      h(
        "div",
        { className: "preview-case-card", style: { maxWidth: "none" } },
        h("div", { className: "preview-case-img", style: { backgroundImage: heroSrc ? "url(" + heroSrc + ")" : "none", aspectRatio: "16/7" } }),
        h(
          "div",
          { className: "preview-case-overlay" },
          h("span", { className: "preview-case-tag" }, v(["tag"], "")),
          h("h3", { style: { fontSize: "1.6rem" } }, v(["title"], "")),
          h("p", {}, v(["subtitle"], ""))
        )
      ),

      h(
        "div",
        { className: "preview-section" },
        h(
          "div",
          { className: "preview-services-grid" },
          [
            ["Kund", v(["customer"], "")],
            ["Plats", v(["location"], "")],
            ["Kategori", v(["category"], "")],
            [v(["extraLabel"], ""), v(["extraValue"], "")],
          ].map(function (pair, i) {
            return h(
              "div",
              { className: "preview-service-card", key: i },
              h("div", { className: "preview-section-label" }, pair[0]),
              h("p", { style: { color: "#1a1a1a", fontWeight: 700 } }, pair[1])
            );
          })
        ),
        h("h2", { className: "preview-section-heading", style: { marginTop: "20px" } }, v(["heading"], "")),
        h("p", { className: "preview-section-intro" }, v(["paragraph1"], "")),
        h("p", { className: "preview-section-intro" }, v(["paragraph2"], "")),
        h("div", { className: "preview-section-label", style: { marginTop: "16px" } }, v(["deliverablesHeading"], "")),
        h(
          "ul",
          { style: { paddingLeft: "20px" } },
          deliverables.map(function (item, i) {
            return h("li", { key: i, style: { fontSize: "0.88rem", color: "#6b6560", marginBottom: "4px" } }, item);
          })
        ),
        h(
          "div",
          { className: "preview-services-grid", style: { marginTop: "16px" } },
          gallery.map(function (img, i) {
            var src = img.image ? getAsset(img.image).toString() : "";
            return h("div", {
              key: i,
              style: { aspectRatio: "1", background: src ? "url(" + src + ") center/cover" : "#eee", borderRadius: "6px" },
            });
          })
        )
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
CMS.registerPreviewTemplate("goteborg", CityPreview);
CMS.registerPreviewTemplate("stockholm", CityPreview);
CMS.registerPreviewTemplate("hallbarhet", HallbarhetPreview);
CMS.registerPreviewTemplate("case-pages", CasePagePreview);
