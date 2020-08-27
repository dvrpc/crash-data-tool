import React, { Component } from 'react';
import "./footer.css";

// imgs
import email from './img/email.png'
import facebook from './img/facebook.png'
import logo from './img/footer-logo.png'
import instagram from './img/instagram.png'
import linkedin from './img/linkedin.png'
import twitter from './img/twitter.png'
import youtube from './img/youtube.png'

class Footer extends Component {
  render() {
    return (
      <footer className="no-print">
        <div id="footer-words">
            <a href="/"><img src={logo} alt="footer logo" id="footer-logo"/></a>
            <address>
                190 N Independence Mall West, 8th Floor,<br />
                Philadelphia, PA 19106-1520<br />
                <a href="tel:+1-215-592-1800">215.592.1800</a> | <a href="mailto:kmurphy@dvrpc.org">kmurphy@dvrpc.org</a> | <a href="/Policies/">Policies</a><br />
                &copy; Delaware Valley Regional Planning Commission 
            </address>
        </div>

        <div id="footer-contact-wrapper">
            <h3>Connect With Us!</h3>
            <div id="footer-social-wrapper">
                <a id="mailto" class="footer-social-link" href="https://signup.e2ma.net/signup/1808352/1403728/" rel="noopener noreferrer" target="_blank">
                    <img loading="lazy"id="email-icon" class="footer-social" src={email} alt="icon link to email" />
                </a>
                <span class="vr"></span>
                <a class="footer-social-link" href="https://www.facebook.com/DVRPC" rel="noopener noreferrer" target="_blank">
                    <img loading="lazy" class="footer-social" src={facebook} alt="icon link to facebook" />
                </a>
                <span class="vr"></span>
                <a class="footer-social-link" href="https://twitter.com/DVRPC" rel="noopener noreferrer" target="_blank">
                    <img loading="lazy" class="footer-social" src={twitter} alt="icon link to twitter" />
                </a>
                <span class="vr"></span>
                <a class="footer-social-link" href="https://www.instagram.com/dvrpc/?hl=en" rel="noopener noreferrer" target="_blank">
                    <img loading="lazy" class="footer-social" src={instagram} alt="icon link to instagram" />
                </a>
                <span class="vr"></span>
                <a class="footer-social-link" href="https://www.linkedin.com/company/delaware-valley-regional-planning-commission" rel="noopener noreferrer" target="_blank">
                    <img loading="lazy" class="footer-social" src={linkedin} alt="icon link to linkedin" />
                </a>
                <span class="vr"></span>
                <a class="footer-social-link" href="https://www.youtube.com/channel/UCEU8UI5_iGkVypHP93b5jLA" rel="noopener noreferrer" target="_blank">
                    <img loading="lazy" class="footer-social" src={youtube} alt="icon link to youtube" />
                </a>
            </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
