import React from "react";

type EventMetaBlockProps = {
  date?: string;
  time?: string;
  location?: string;
  venue?: string;
};

export function EventMetaBlock({
  date,
  time,
  location,
  venue,
}: EventMetaBlockProps) {
  return (
    <dl data-block-type="eventMeta">
      {date ? (
        <>
          <dt>Date</dt>
          <dd>{date}</dd>
        </>
      ) : null}
      {time ? (
        <>
          <dt>Time</dt>
          <dd>{time}</dd>
        </>
      ) : null}
      {location ? (
        <>
          <dt>Location</dt>
          <dd>{location}</dd>
        </>
      ) : null}
      {venue ? (
        <>
          <dt>Venue</dt>
          <dd>{venue}</dd>
        </>
      ) : null}
    </dl>
  );
}
