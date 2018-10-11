const i18nConfig = require("./src/config/i18n");
const queries = require("./src/queries");
const path = require("path");

exports.createPages = ({ actions, graphql }) => {
  const { createPage, createRedirect } = actions;
  const blogPostTemplate = path.resolve("src/components/pages/BlogPost.js");
  const blogIndexTemplate = path.resolve("src/components/pages/BlogIndex.js");
  const showcasePostTemplate = path.resolve(
    "src/components/pages/ShowcasePost.js"
  );
  const showcaseIndexTemplate = path.resolve(
    "src/components/pages/ShowcaseIndex.js"
  );
  const naked = ["/", "/blog", "/showcase"];

  createPageRedirects = function() {
    for (nakedPath of naked) {
      createRedirect({
        fromPath: nakedPath,
        isPermanent: true,
        redirectInBrowser: true,
        toPath: "/" + i18nConfig.defaultLanguage + nakedPath
      });
    }
  };

  createBlogPostRedirect = function(slug) {
    createRedirect({
      fromPath: "/blog/" + slug,
      isPermanent: true,
      redirectInBrowser: true,
      toPath: "/" + i18nConfig.defaultLanguage + "/blog/" + slug
    });
  };

  createShowcasePostRedirect = function(slug) {
    createRedirect({
      fromPath: "/showcase/" + slug,
      isPermanent: true,
      redirectInBrowser: true,
      toPath: "/" + i18nConfig.defaultLanguage + "/showcase/" + slug
    });
  };

  createBlogIndex = function(language, posts) {
    createPage({
      path: `/${language}/blog`,
      component: blogIndexTemplate,
      context: {
        posts,
        language,
        slug: `/${language}/blog`
      }
    });
  };

  createShowcaseIndex = function(language, posts) {
    createPage({
      path: `/${language}/showcase`,
      component: showcaseIndexTemplate,
      context: {
        posts,
        language,
        slug: `/${language}/showcase`
      }
    });
  };

  createBlogPost = function(language, contentLanguage, slug, node) {
    createPage({
      path: `/${language}/blog/${slug}`,
      component: blogPostTemplate,
      context: {
        node,
        contentLanguage,
        language,
        slug: `/${language}/blog/${slug}`
      }
    });
  };

  createShowcasePost = function(language, contentLanguage, slug, node) {
    createPage({
      path: `/${language}/showcase/${slug}`,
      component: showcasePostTemplate,
      context: {
        node,
        contentLanguage,
        language,
        slug: `/${language}/showcase/${slug}`
      }
    });
  };

  createBlogPosts = function() {
    let posts = {};
    let postOrder = {};
    for (let lang of i18nConfig.languages) {
      posts[lang] = {};
      postOrder[lang] = [];
    }

    graphql(queries.allBlogPosts).then(res => {
      if (res.errors) return Promise.reject(res.erros);

      // Sort all posts into posts object and postOrder array
      Object.keys(res.data.allMarkdownRemark.edges).forEach(key => {
        let node = res.data.allMarkdownRemark.edges[key].node;
        let slug = path.basename(node.frontmatter.path);
        let language = node.frontmatter.path.split("/")[1];
        posts[language][slug] = node;
        postOrder[language].push(slug);
        createBlogPostRedirect(slug);
      });

      // Create pages for blog posts in all languages
      for (let lang of i18nConfig.languages) {
        for (slug of postOrder[i18nConfig.defaultLanguage]) {
          let contentLanguage;
          let postNode;
          let origNode = posts[lang][slug];
          if (typeof posts[lang][slug] === "undefined") {
            // Post not available in this language, use default language instead
            contentLanguage = i18nConfig.defaultLanguage;
            postNode = posts[i18nConfig.defaultLanguage][slug];
          } else {
            contentLanguage = lang;
            postNode = posts[lang][slug];
          }
          createBlogPost(lang, contentLanguage, slug, postNode);
        }
        createBlogIndex(lang, posts);
      }
    });
  };

  createShowcasePosts = function() {
    let posts = {};
    let postOrder = {};
    for (let lang of i18nConfig.languages) {
      posts[lang] = {};
      postOrder[lang] = [];
    }

    graphql(queries.allShowcasePosts).then(res => {
      if (res.errors) return Promise.reject(res.erros);

      // Sort all posts into posts object and postOrder array
      Object.keys(res.data.allMarkdownRemark.edges).forEach(key => {
        let node = res.data.allMarkdownRemark.edges[key].node;
        let slug = path.basename(node.frontmatter.path);
        let language = node.frontmatter.path.split("/")[1];
        posts[language][slug] = node;
        postOrder[language].push(slug);
        createShowcasePostRedirect(slug);
      });

      // Create pages for showcase posts in all languages
      for (let lang of i18nConfig.languages) {
        for (slug of postOrder[i18nConfig.defaultLanguage]) {
          let contentLanguage;
          let postNode;
          let origNode = posts[lang][slug];
          if (typeof posts[lang][slug] === "undefined") {
            // Post not available in this language, use default language instead
            contentLanguage = i18nConfig.defaultLanguage;
            postNode = posts[i18nConfig.defaultLanguage][slug];
          } else {
            contentLanguage = lang;
            postNode = posts[lang][slug];
          }
          createShowcasePost(lang, contentLanguage, slug, postNode);
        }
        createShowcaseIndex(lang, posts);
      }
    });
  };

  return new Promise((resolve, reject) => {
    createPageRedirects();
    createBlogPosts();
    createShowcasePosts();
    /** FIXME: This is an embarassing hack because we return here before all pages are created
     * and that causes webpack issues when deploying to netlify
     * see: https://github.com/gatsbyjs/gatsby/issues/8936
     * This ugly hack needs to go, in favor of proper promises
     */
    setTimeout(() => {
      resolve();
    }, 15000);
  });
};
