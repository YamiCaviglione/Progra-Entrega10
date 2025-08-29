import { describe, it, expect } from "vitest";
import { voteReview, Review } from "../reviews";

describe("voteReview", () => {
  const base: Review[] = [
    { id: "1", user: "Yami", rating: 5, text: "Buenísimo", upvotes: 0, downvotes: 0, userVote: null },
  ];

  it("agrega un like correctamente", () => {
    const updated = voteReview(base, "1", "like");
    expect(updated[0].upvotes).toBe(1);
    expect(updated[0].downvotes).toBe(0);
    expect(updated[0].userVote).toBe("like");
  });

  it("cambia de like a dislike", () => {
    let updated = voteReview(base, "1", "like");
    updated = voteReview(updated, "1", "dislike");
    expect(updated[0].upvotes).toBe(0);
    expect(updated[0].downvotes).toBe(1);
    expect(updated[0].userVote).toBe("dislike");
  });

  it("no duplica el mismo voto", () => {
    let updated = voteReview(base, "1", "like");
    updated = voteReview(updated, "1", "like");
    expect(updated[0].upvotes).toBe(1); // sigue siendo 1
  });
});
