import BookingButton from "@/components/BookingButton";

/** スマホのみ画面下部に固定する予約バー。 */
export default function MobileBookingBar() {
  return (
    <div
      className="md:hidden"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 55,
        height: 64,
        display: "flex",
        padding: "10px 16px",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(42,42,42,0.1)",
      }}
    >
      <BookingButton
        location="mobile_bar"
        label="予約する（Upnow）"
        style={{ flex: 1, padding: 0 }}
      />
    </div>
  );
}
