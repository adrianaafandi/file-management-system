import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { handle } from "hono/vercel";
import { prisma } from "../../../../lib/prisma";
import path from "path";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import mime from "mime-types";

const app = new Hono().basePath("/api/files");

// POST route to upload files
app.post("/", async (c) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new HTTPException(400, { message: "No file uploaded" });
    }

    const originalName = file.name;
    const filePath = path.join(uploadsDir, originalName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    const uploadFile = await prisma.file.create({
      data: {
        name: originalName,
        path: `/uploads/${originalName}`,
        size: file.size,
        type: file.type || "application/octet-stream",
      },
    });

    return c.json(
      {
        message: "File uploaded successfully",
        data: uploadFile,
      },
      201
    );
  } catch (error) {
    console.error("File upload error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// GET route to retrieve files
app.get("/", async (c) => {
  try {
    const files = await prisma.file.findMany({
      orderBy: { createdAt: "desc" },
    });

    return c.json({
      message: "Files retrieved successfully",
      data: files,
    });
  } catch (error) {
    console.error("Fetch files error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// GET route to serve file content
app.get("/content/:fileName", async (c) => {
  const fileName = c.req.param("fileName");
  const filePath = path.resolve("uploads", fileName);

  try {
    const contentType = mime.lookup(filePath) || "application/octet-stream";
    const fileContent = contentType.startsWith("text/")
      ? await fs.readFile(filePath, "utf-8")
      : `data:${contentType};base64,${(await fs.readFile(filePath)).toString(
          "base64"
        )}`;

    return c.json({ content: fileContent, type: contentType });
  } catch (error) {
    throw new HTTPException(404, { message: "File not found." });
  }
});

// GET route to download files
app.get("/uploads/:fileName", async (c) => {
  try {
    const fileName = c.req.param("fileName");
    const filePath = path.join(process.cwd(), "uploads", fileName);

    if (!existsSync(filePath)) {
      throw new HTTPException(404, { message: "File not found" });
    }

    const fileContent = await fs.readFile(filePath);
    const mimeType = mime.lookup(filePath) || "application/octet-stream";

    c.res.headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
    c.res.headers.set("Content-Type", mimeType);

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(fileContent);
        controller.close();
      }
    });

    return c.body(stream);
  } catch (error) {
    console.error("File serving error:", error);
    throw new HTTPException(404, { message: "File not found" });
  }
});

// GET route for downloading files directly
app.get('/download/:fileName', async (c) => {
  try {
    const fileName = c.req.param('fileName');
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    // Check if file exists
    if (!existsSync(filePath)) {
      throw new HTTPException(404, { message: 'File not found.' });
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const fileContent = await fs.readFile(filePath);

    c.res.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    c.res.headers.set('Content-Type', mimeType);

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(fileContent);
        controller.close();
      }
    });

    return c.body(stream);
  } catch (error) {
    console.error('Download error:', error);
    throw new HTTPException(500, { message: 'Failed to download file.' });
  }
});


// PUT route to update files
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name, path } = await c.req.json();

    const updatedFile = await prisma.file.update({
      where: { id },
      data: { name, path },
    });

    return c.json({
      message: "File updated successfully",
      data: updatedFile,
    });
  } catch (error) {
    console.error("File update error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// DELETE route to delete files
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    await prisma.file.delete({
      where: { id },
    });

    return c.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("File delete error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

export const POST = handle(app);
export const GET = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
