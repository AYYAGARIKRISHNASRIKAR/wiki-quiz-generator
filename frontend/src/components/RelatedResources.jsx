import React from 'react';
import { truncateText } from "../utils/helper";

export default function RelatedResources({ topics = [], links = [], className = '' }) {
    const truncateWikiTitle = (url) => {
        const title = url
            .replace('https://en.wikipedia.org/wiki/', '')
            .replace('https://en.wikipedia.org/w/index.php?title=', '')
            .replace(/_/g, ' ')
            .replace(/%20/g, ' ');

        return truncateText(title, 40);
    };

    const isValidWikiUrl = (url) => {
        try {
            const parsed = new URL(url);
            return parsed.hostname.includes('wikipedia.org') &&
                (parsed.pathname.includes('/wiki/') || parsed.search.includes('title='));
        } catch {
            return false;
        }
    };

    if (!topics.length && !links.length) {
        return null;
    }

    return (
        <div className={`related-resources ${className}`}>
            {topics.length > 0 && (
                <div className="related-topics-section">
                    <h4 className="section-title">Related Topics</h4>
                    <div className="topics-grid">
                        {topics.slice(0, 12).map((topic, index) => (
                            <span key={index} className="topic-tag">
                                {topic}
                            </span>
                        ))}
                        {topics.length > 12 && (
                            <span className="topic-tag topic-tag-more">
                                +{topics.length - 12} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {links.length > 0 && (
                <div className="related-links-section">
                    <h4 className="section-title">Learn More</h4>
                    <div className="links-grid">
                        {links.slice(0, 8).map((link, index) => (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`related-link ${isValidWikiUrl(link) ? 'wiki-link' : ''}`}
                                title={truncateWikiTitle(link)}
                            >
                                {truncateWikiTitle(link)}
                                <span className="external-icon">↗</span>
                            </a>
                        ))}
                        {links.length > 8 && (
                            <span className="related-link related-link-more">
                                +{links.length - 8} more links
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
