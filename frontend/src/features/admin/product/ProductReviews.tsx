// src/components/products/ProductReviews.tsx
import { useState } from "react";
import { Star, User } from "lucide-react";
import Button from "../../../components/ui/Button";
import type { ReviewItem } from "../../../types";

interface ProductReviewsProps {
  productId: string;
  reviews: ReviewItem[];
  onAddReview: (review: Omit<ReviewItem, "id" | "date">) => void;
  averageRating?: number;
}

export default function ProductReviews({
  reviews,
  onAddReview,
  averageRating = 4.8,
}: ProductReviewsProps) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    onAddReview({ user: authorName, rating, comment });
    setAuthorName("");
    setComment("");
    setRating(5);
  };

  return (
    <section className="mt-16 border-t border-zinc-200 dark:border-white/5 pt-12 transition-colors">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <section>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Community Validated
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight mt-1">
            Reviews & Ratings
          </h2>
        </section>

        <section className="flex items-center gap-2 bg-zinc-50 dark:bg-[#0b0b0b] border border-zinc-200 dark:border-white/5 px-4 py-2.5 rounded-2xl">
          <section className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.round(averageRating) ? "currentColor" : "none"}
              />
            ))}
          </section>
          <span className="text-sm font-black ml-2">
            {averageRating.toFixed(1)} / 5.0
          </span>
          <span className="text-xs text-zinc-400 dark:text-gray-500">
            ({reviews.length} reviews)
          </span>
        </section>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Submission Form */}
        <section className="lg:col-span-5 bg-zinc-50 dark:bg-[#0b0b0b] border border-zinc-200 dark:border-white/5 p-6 rounded-3xl h-fit">
          <h3 className="text-sm font-black uppercase tracking-wider mb-4">
            Leave a Review
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <section>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-gray-500 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Joe Doe"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors text-zinc-900 dark:text-white"
              />
            </section>

            <section>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-gray-500 mb-1">
                Rating Score
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors cursor-pointer text-zinc-900 dark:text-white"
              >
                <option value={5}>5 Stars - Exceptional</option>
                <option value={4}>4 Stars - Solid Performance</option>
                <option value={3}>3 Stars - Average</option>
                <option value={2}>2 Stars - Subpar</option>
                <option value={1}>1 Star - Unsatisfactory</option>
              </select>
            </section>

            <section>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-gray-500 mb-1">
                Feedback Comment
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write your experience with this component..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-white/5 rounded-xl p-4 text-sm outline-none focus:border-blue-500 transition-colors resize-none text-zinc-900 dark:text-white"
              />
            </section>

            <Button
              label="Post Feedback Node"
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-colors"
            />
          </form>
        </section>

        {/* Reviews List */}
        <section className="lg:col-span-7 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-zinc-400 dark:text-gray-500 text-xs font-mono py-8 text-center">
              No community feedback entries initialized yet.
            </p>
          ) : (
            reviews.map((rev) => {
              // Safely evaluate `rev.user` whether it's a string or an object {name, email}
              let displayName = "Guest";
              if (typeof rev.user === "string") {
                displayName = rev.user;
              } else if (rev.user && typeof rev.user === "object") {
                displayName = (rev.user as any).name || (rev.user as any).email || "Guest";
              } else if (rev.authorName) {
                displayName = rev.authorName;
              }

              // Safely handle date to prevent React child crashes
              const rawDate = rev.date || rev.createdAt;
              let displayDate = "Just now";
              if (rawDate) {
                if (typeof rawDate === "object" && rawDate !== null) {
                  displayDate = "toDateString" in rawDate && typeof (rawDate as any).toDateString === "function"
                    ? (rawDate as Date).toLocaleDateString()
                    : JSON.stringify(rawDate);
                } else {
                  displayDate = String(rawDate);
                }
              }

              return (
                <section
                  key={rev.id || Math.random()}
                  className="bg-zinc-50 dark:bg-[#0b0b0b] border border-zinc-200 dark:border-white/5 p-5 rounded-3xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <User size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-black uppercase tracking-wide text-zinc-900 dark:text-white block">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-gray-500 font-mono">
                          {displayDate}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Breakdown */}
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-zinc-600 dark:text-gray-400 text-xs leading-relaxed pl-10">
                    {rev.comment}
                  </p>
                </section>
              );
            })
          )}
        </section>
      </section>
    </section>
  );
}