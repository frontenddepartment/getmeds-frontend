<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - Getmeds</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            background-color: #f7f9fa;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          h1 {
            color: #00875a;
            margin-top: 0;
            font-size: 28px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          h1 img {
            height: 35px;
          }
          p.expl {
            margin: 10px 0 20px;
            font-size: 14px;
            color: #666;
            line-height: 1.5;
          }
          a {
            color: #00875a;
            text-decoration: none;
            font-weight: 500;
          }
          a:hover {
            text-decoration: underline;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #f2f5f7;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e1e4e6;
            font-size: 13px;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e1e4e6;
            font-size: 13px;
            word-break: break-all;
          }
          tr:hover td {
            background-color: #fcfdfe;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>
            <img src="/assets/logo.png" alt="Getmeds Logo" onerror="this.style.display='none'" />
            XML Sitemap
          </h1>
          <p class="expl">
            This XML Sitemap is generated dynamically to help search engines like Google discover and index our pages. Humans can use it as a directory: click on any URL below to navigate directly to that page.
          </p>
          
          <xsl:if test="sitemap:sitemapindex">
            <p class="expl"><strong>Sitemap Index:</strong> Below are the sub-sitemaps for categories, products, and blog posts.</p>
            <table>
              <thead>
                <tr>
                  <th>Sitemap Link</th>
                  <th style="width: 25%">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td>
                      <xsl:variable name="sitemap_loc" select="sitemap:loc"/>
                      <a href="{$sitemap_loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
          
          <xsl:if test="sitemap:urlset">
            <p class="expl">This sub-sitemap contains <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs.</p>
            <table>
              <thead>
                <tr>
                  <th>URL Link</th>
                  <th style="width: 15%">Priority</th>
                  <th style="width: 15%">Change Freq</th>
                  <th style="width: 20%">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <xsl:variable name="item_loc" select="sitemap:loc"/>
                      <a href="{$item_loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td><xsl:value-of select="sitemap:priority"/></td>
                    <td><xsl:value-of select="sitemap:changefreq"/></td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
