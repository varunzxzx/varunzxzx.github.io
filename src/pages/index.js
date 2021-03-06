import React, { useEffect } from 'react';
import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import { Layout, Hero, About, Featured, Projects, Contact, BlogPosts } from '@components';
import styled from 'styled-components';
import { mixins, Main } from '@styles';

const MainContainer = styled(Main)`
  ${mixins.sidePadding};
  counter-reset: section;
`;

const IndexPage = ({ data }) => {
  // scroll to the specific section if the site is loaded again
  useEffect(() => {
    if (window.location.href.indexOf('#') !== -1) {
      const url = window.location.href;
      const id = url.split('#')[1];
      const element = document.getElementById(id);
      try {
        element.scrollIntoView();
      } catch {
        // do nothing
      }
    }
  });

  return (
    <Layout showMeta={true}>
      <MainContainer id="content">
        <Hero data={data.hero.edges} />
        <About data={data.about.edges} />
        <Featured data={data.featured.edges} />
        <Projects data={data.projects.edges} />
        <BlogPosts data={data.blogPosts.edges} />
        <Contact data={data.contact.edges} />
      </MainContainer>
    </Layout>
  );
};

IndexPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default IndexPage;

export const pageQuery = graphql`
  {
    hero: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/hero/" } }) {
      edges {
        node {
          frontmatter {
            title
            name
            subtitle
            contactText
          }
          html
        }
      }
    }
    about: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/about/" } }) {
      edges {
        node {
          frontmatter {
            title
            avatar {
              childImageSharp {
                fluid(maxWidth: 700, quality: 90, traceSVG: { color: "#64ffda" }) {
                  ...GatsbyImageSharpFluid_withWebp_tracedSVG
                }
              }
            }
            skills
          }
          html
        }
      }
    }
    featured: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/featured/" } }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          frontmatter {
            title
            cover {
              childImageSharp {
                fluid(maxWidth: 700, quality: 90, traceSVG: { color: "#64ffda" }) {
                  ...GatsbyImageSharpFluid_withWebp_tracedSVG
                }
              }
            }
            tech
            github
            external
            show
          }
          html
        }
      }
    }
    projects: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/projects/" } }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          frontmatter {
            title
            image
            tech
            github
            external
            show
          }
          html
        }
      }
    }
    blogPosts: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/blog/" } }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 6
    ) {
      edges {
        node {
          frontmatter {
            title
            date
            slug
            tags
            show
            authorName
            authorImg {
              childImageSharp {
                fluid(maxWidth: 30, quality: 90, traceSVG: { color: "#64ffda" }) {
                  ...GatsbyImageSharpFluid_withWebp_tracedSVG
                }
              }
            }
            featuredImg {
              childImageSharp {
                fluid(maxWidth: 300, quality: 90, traceSVG: { color: "#64ffda" }) {
                  ...GatsbyImageSharpFluid_withWebp_tracedSVG
                }
              }
            }
          }
          timeToRead
          excerpt(pruneLength: 300)
          html
        }
      }
    }
    contact: allMarkdownRemark(filter: { fileAbsolutePath: { regex: "/contact/" } }) {
      edges {
        node {
          frontmatter {
            title
          }
          html
        }
      }
    }
  }
`;
