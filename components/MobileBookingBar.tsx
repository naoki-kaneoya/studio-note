import BookingButton from "@/components/BookingButton";

/** スマホのみ画面下部に固定する予約バー。 */
export default function MobileBookingBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-base/95 px-4 py-2 backdrop-blur md:hidden">
      <BookingButton location="mobile_bar" className="w-full" />
    </div>
  );
}
