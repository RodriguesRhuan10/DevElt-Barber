import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, email, phone, type, message } = data

    if (!name || !email || !type || !message) {
      return NextResponse.json(
        { message: "Dados incompletos" },
        { status: 400 }
      )
    }

    // Configurar o transporte de email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SUPPORT_EMAIL,
        pass: process.env.SUPPORT_EMAIL_PASSWORD,
      },
    })

    // Configurar o email
    const mailOptions = {
      from: email,
      to: "develtlab@gmail.com",
      subject: `[Suporte] - ${type}`,
      html: `
        <h2>Nova mensagem de suporte</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Telefone:</strong> ${phone}</p>` : ""}
        <p><strong>Tipo:</strong> ${type}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `,
    }

    // Enviar o email
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { success: true, message: "Email enviado com sucesso!" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    return NextResponse.json(
      { success: false, message: "Erro ao enviar email" },
      { status: 500 }
    )
  }
} 