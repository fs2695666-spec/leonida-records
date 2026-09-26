'use client';
import { useState } from 'react';
import { WorldMap } from './WorldMap';

// Community map by State of Leonida (Mapping Community). Not official, not ours:
// always credited and linked. Their site has no Spanish version, so English is used.
export const COMMUNITY_MAP = {
  url: 'https://map.stateofleonida.net/en/',
  home: 'https://map.stateofleonida.net/',
  name: 'State of Leonida',
};

/**
 * Map section: community map (default) + our own archive map.
 * The community map loads only on demand (click-to-load facade): keeps the home page
 * fast, avoids a third-party request on every visit and avoids trapping scroll on phones.
 */
export function LeonidaMap({ places, labels, t }) {
  const [tab, setTab] = useState('community');
  const [loaded, setLoaded] = useState(false);
  const hasPlaces = places.length > 0;

  return (
    <div className="lmap">
      {hasPlaces && (
        <div className="lmap__tabs" role="tablist" aria-label={labels.title}>
          <button type="button" role="tab" id="lmap-tab-community" aria-controls="lmap-community" aria-selected={tab === 'community'} onClick={() => setTab('community')}>
            {t.communityTab}
          </button>
          <button type="button" role="tab" id="lmap-tab-archive" aria-controls="lmap-archive" aria-selected={tab === 'archive'} onClick={() => setTab('archive')}>
            {t.archiveTab}
          </button>
        </div>
      )}

      <div id="lmap-community" role="tabpanel" aria-labelledby="lmap-tab-community" hidden={tab !== 'community'}>
        <div className="lmap__frame" data-loaded={loaded || undefined}>
          {loaded ? (
            <>
              <iframe
                src={COMMUNITY_MAP.url}
                title={t.iframeTitle}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="fullscreen"
                allowFullScreen
              />
              <div className="lmap__bar">
                <a className="lmap__barbtn" href={COMMUNITY_MAP.url} target="_blank" rel="noopener noreferrer">{t.open} ↗</a>
                <button type="button" className="lmap__barbtn" onClick={() => setLoaded(false)}>{t.close}</button>
              </div>
            </>
          ) : (
            <div className="lmap__facade">
              <div className="lmap__grid" aria-hidden="true" />
              <div className="lmap__glow" aria-hidden="true" />
              <div className="lmap__facade-body">
                <p className="lmap__tag">{t.tag}</p>
                <h3 className="lmap__title display">{t.title}</h3>
                <p className="lmap__text">{t.text}</p>
                <div className="lmap__ctas">
                  <button type="button" className="btn btn--light" onClick={() => setLoaded(true)}>{t.load}</button>
                  <a className="btn btn--outline-light" href={COMMUNITY_MAP.url} target="_blank" rel="noopener noreferrer">{t.open} ↗</a>
                </div>
                <p className="lmap__hint">{t.mobileHint}</p>
              </div>
            </div>
          )}
        </div>
        <p className="world__note">
          {t.creditBefore} <a href={COMMUNITY_MAP.home} target="_blank" rel="noopener noreferrer">{COMMUNITY_MAP.name}</a> {t.creditAfter}
        </p>
      </div>

      {hasPlaces && (
        <div id="lmap-archive" role="tabpanel" aria-labelledby="lmap-tab-archive" hidden={tab !== 'archive'}>
          <WorldMap places={places} labels={labels} />
          <p className="world__note">{t.archiveNote}</p>
        </div>
      )}
    </div>
  );
}
