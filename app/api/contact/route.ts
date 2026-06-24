import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  company?: string;
  name?: string;
  email?: string;
  tel?: string;
  genre?: string;
  place?: string;
  period?: string;
  budget?: string;
  message?: string;
  // ハニーポット
  company_website?: string;
};

export async function POST(req: Request) {
  let data: ContactPayload;
  try {
    data = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { message: "リクエストの形式が不正です。" },
      { status: 400 }
    );
  }

  // ハニーポット：値が入っていればボットとみなし、正常応答を返しつつ送信スキップ
  if (data.company_website) {
    return NextResponse.json({ ok: true });
  }

  // 必須バリデーション
  const required: (keyof ContactPayload)[] = [
    "company",
    "name",
    "email",
    "genre",
    "place",
    "message",
  ];
  for (const key of required) {
    if (!data[key] || String(data[key]).trim() === "") {
      return NextResponse.json(
        { message: "必須項目が入力されていません。" },
        { status: 400 }
      );
    }
  }
  if (!EMAIL_RE.test(String(data.email))) {
    return NextResponse.json(
      { message: "メールアドレスの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.CONTACT_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("[contact] Resend 環境変数が未設定です。");
    return NextResponse.json(
      { message: "送信設定が未完了です。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  const body = [
    ["会社名", data.company],
    ["ご担当者名", data.name],
    ["メールアドレス", data.email],
    ["電話番号", data.tel || "（未入力）"],
    ["撮影ジャンル", data.genre],
    ["撮影場所", data.place],
    ["希望時期", data.period || "（未入力）"],
    ["ご予算感", data.budget || "（未入力）"],
    ["内容・ご相談", data.message],
  ]
    .map(([k, v]) => `${k}：${v}`)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: String(data.email),
      subject: "【Studio note】撮影依頼のお問い合わせ",
      text: `撮影依頼のお問い合わせがありました。\n\n${body}\n`,
    });
    if (error) {
      console.error("[contact] Resend error", error);
      return NextResponse.json(
        { message: "送信に失敗しました。時間をおいて再度お試しください。" },
        { status: 502 }
      );
    }
  } catch (e) {
    console.error("[contact] send failed", e);
    return NextResponse.json(
      { message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
