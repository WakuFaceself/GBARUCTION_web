import React from "react";

type Card = {
  title: string;
  description?: string;
  href?: string;
};

type CardGridBlockProps = {
  title?: string;
  description?: string;
  cards: Card[];
};

export function CardGridBlock({ title, description, cards }: CardGridBlockProps) {
  return (
    <section data-block-type="cardGrid">
      {title ? <h2>{title}</h2> : null}
      {description ? <p>{description}</p> : null}
      <div>
        {cards.map((card) => (
          <article key={`${card.title}-${card.href ?? "card"}`}>
            {card.href ? <a href={card.href}>{card.title}</a> : <h3>{card.title}</h3>}
            {card.description ? <p>{card.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
