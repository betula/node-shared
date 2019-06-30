/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

// const CompLibrary = require('../../core/CompLibrary.js');

// const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
// const Container = CompLibrary.Container;
// const GridBlock = CompLibrary.GridBlock;


class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );


    return (
      <div>
        <div style={{ background: "#20232a", textAlign: "center", padding: "30px 0" }}>
          <img src={`${baseUrl}img/home-logo.svg`} />
        </div>
        <div className="homeContainer">
          <div className="homeSplashFade">
            <div className="wrapper homeWrapper">
              <div className="inner">
                <h2 className="projectTitle">
                  <small>{siteConfig.tagline}</small>
                </h2>
                <PromoSection>
                  <Button href={docUrl('intro.html')}>Try It Out</Button>
                </PromoSection>
              </div>
            </div>
          </div>
        </div>
        <div className="mainContainer">
        </div>
      </div>
    );
  }
}

module.exports = Index;
