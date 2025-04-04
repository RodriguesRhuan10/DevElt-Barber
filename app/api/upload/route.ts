import { v2 as cloudinary } from "cloudinary"
import { NextRequest, NextResponse } from "next/server"

// Log para debug das variáveis de ambiente
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Definido" : "Não definido",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Definido" : "Não definido"
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configurar o tamanho máximo do payload
export const maxDuration = 10 // 10 segundos
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado" },
        { status: 400 }
      )
    }

    // Log para debug
    console.log("Arquivo recebido:", {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Converter o arquivo para um buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload para o Cloudinary usando Promise
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "profile-images",
          },
          (error, result) => {
            if (error) {
              console.error("Erro no Cloudinary:", error)
              reject(error)
            } else {
              resolve(result)
            }
          }
        )

        // Escrever o buffer no stream
        uploadStream.end(buffer)
      })
    }

    const result = await uploadToCloudinary()

    // Log do resultado
    console.log("Upload bem-sucedido:", result)

    return NextResponse.json({ 
      url: (result as any).secure_url,
      success: true
    })

  } catch (error) {
    // Log detalhado do erro
    console.error("Erro detalhado no upload:", {
      error,
      message: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { 
        error: "Erro ao fazer upload do arquivo",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
} 