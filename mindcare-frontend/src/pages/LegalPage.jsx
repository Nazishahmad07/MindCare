import React from 'react'
import { Link } from 'react-router-dom'
import '../components/legal.css'

const privacySections = [
  { title: 'Information We Collect', body: <><p>When you use MindCare AI, we may collect:</p><ul><li>Full name and email address</li><li>Account and authentication information</li><li>Mood and wellness information you voluntarily provide</li><li>AI chat and interaction data</li><li>Emergency contact number and email</li><li>Basic technical information required to operate the platform</li></ul></> },
  { title: 'How We Use Your Information', body: <><p>We use your information to:</p><ul><li>Create and manage your account</li><li>Provide mood tracking and wellness insights</li><li>Provide AI-powered wellness guidance</li><li>Personalize your experience</li><li>Provide emergency-support features</li><li>Improve and secure our platform</li></ul></> },
  { title: 'Data Protection', body: <><p>We take reasonable measures to protect your personal information from unauthorized access, misuse, or disclosure. However, no online service can guarantee complete security.</p><p>We <strong>do not sell your personal information</strong>.</p></> },
  { title: 'AI & Mental Wellness', body: <><p>MindCare AI provides general wellness information and AI-powered support. It is <strong>not a medical or mental-health diagnosis or treatment service</strong> and should not replace professional medical advice.</p><p>If you are experiencing an emergency or immediate danger, contact your local emergency services or a qualified professional.</p></> },
  { title: 'Your Rights', body: <p>You may contact us to request access, correction, or deletion of your personal information, subject to applicable laws.</p> },
  { title: 'Contact Us', body: <p>For privacy-related questions or requests, email <a href="mailto:nazishmallick58@gmail.com">nazishmallick58@gmail.com</a>.</p> },
]

const termsSections = [
  { title: '1. Our Service', body: <><p>MindCare AI is a digital wellness platform designed primarily for students. It provides features such as:</p><ul><li>Mood tracking</li><li>Mood insights</li><li>AI-powered wellness guidance</li><li>Personalized recommendations</li><li>Mental wellness resources</li><li>Emergency-support features</li></ul></> },
  { title: '2. Not Medical Advice', body: <><p>MindCare AI is <strong>not a medical or emergency service</strong>.</p><p>AI-generated responses and wellness recommendations are for general informational and wellness purposes only. They should not be considered professional medical, psychological, or psychiatric advice.</p><p>For serious concerns or emergencies, contact a qualified professional or your local emergency services.</p></> },
  { title: '3. Your Account', body: <><p>You are responsible for:</p><ul><li>Providing accurate information</li><li>Keeping your password secure</li><li>Maintaining the security of your account</li><li>Using the platform responsibly</li></ul><p>Do not use another person's account or attempt to gain unauthorized access to the platform.</p></> },
  { title: '4. Emergency Contacts', body: <><p>If you provide an emergency contact, you confirm that you are authorized to provide their contact information.</p><p>Providing an emergency contact does <strong>not guarantee emergency assistance or a response</strong>.</p></> },
  { title: '5. Acceptable Use', body: <><p>You agree not to:</p><ul><li>Misuse or disrupt the platform</li><li>Attempt unauthorized access</li><li>Introduce malicious software</li><li>Abuse other users</li><li>Use the platform for unlawful activities</li><li>Copy or exploit MindCare AI's software, branding, or content without permission</li></ul></> },
  { title: '6. AI-Generated Content', body: <p>AI-generated responses may occasionally be inaccurate or incomplete. You should use your judgment and seek professional advice when necessary.</p> },
  { title: '7. Intellectual Property', body: <p>The MindCare AI name, logo, website design, software, and original content belong to MindCare AI or their respective owners and may not be reproduced without permission.</p> },
  { title: '8. Service Availability', body: <p>We work to keep MindCare AI available and reliable, but we do not guarantee uninterrupted or error-free service.</p> },
  { title: '9. Changes to These Terms', body: <p>We may update these Terms from time to time. Updated Terms will be posted on this page with a revised date.</p> },
  { title: '10. Contact Us', body: <p>For questions regarding these Terms, email <a href="mailto:nazishmallick58@gmail.com">nazishmallick58@gmail.com</a>.</p> },
]

export default function LegalPage({ type }) {
  const isPrivacy = type === 'privacy'
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service'
  const sections = isPrivacy ? privacySections : termsSections

  return (
    <main className="legal-page">
      <article className="legal-card">
        <header className="legal-header">
          <Link className="legal-brand" to="/"><span aria-hidden="true">✳</span> MindCare AI</Link>
          <Link className="legal-home" to="/">← Back to home page</Link>
          <p className="legal-kicker">MindCare AI · Student wellness</p>
          <h1>{title}</h1>
          <p className="legal-updated">Last updated: October 6, 2026</p>
          <p className="legal-intro">{isPrivacy
            ? <>At <strong>MindCare AI</strong>, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect and use information when you use our platform.</>
            : <>Welcome to <strong>MindCare AI</strong>. By accessing or using our platform, you agree to these Terms of Service.</>}</p>
        </header>
        <div className="legal-sections">
          {sections.map(section => <section key={section.title}><h2>{section.title}</h2>{section.body}</section>)}
        </div>
        <footer className="legal-footer"><Link to="/">MindCare AI</Link><span>Wellness support, not medical advice.</span></footer>
      </article>
    </main>
  )
}
