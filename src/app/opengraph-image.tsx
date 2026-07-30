import { ImageResponse } from "next/og";

export const alt = "720 Ready — Claude Certified Architect Foundations Exam Prep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          backgroundColor: "#f7f7f5",
          backgroundImage: "linear-gradient(135deg, #e3eefb 0%, #f7f7f5 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#2a78d6",
              color: "#ffffff",
              fontSize: 36,
              fontWeight: 700,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            72
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              color: "#1c1d1f",
            }}
          >
            720 Ready
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 32,
            fontWeight: 600,
            color: "#1c5cab",
          }}
        >
          Claude Certified Architect — Foundations Exam Prep
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 26,
            color: "#55585e",
            maxWidth: 900,
          }}
        >
          Flashcards, practice questions, and full mock exams. No account needed to start.
        </div>
      </div>
    ),
    { ...size },
  );
}
