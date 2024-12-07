import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { handle } from "hono/vercel";
import { prisma } from "../../../../lib/prisma";

const app = new Hono().basePath("/api/files");

// Create a new file
app.post("/", async (c) => {
  try {
    const { name, path, size, type } = await c.req.json();
    
    const uploadFile = await prisma.file.create({
      data: {
        name,
        path,
        size,
        type,
      }
    });

    return c.json({
      message: "File uploaded successfully",
      data: uploadFile
    }, 201);
  } catch (error) {
    console.error("File upload error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// Get all files
app.get("/", async (c) => {
  try {
    const files = await prisma.file.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return c.json({
      message: "Files retrieved successfully",
      data: files
    });
  } catch (error) {
    console.error("Fetch files error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// Get a single file by ID
app.get("/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const file = await prisma.file.findUnique({
      where: { id }
    });

    if (!file) {
      throw new HTTPException(404, { message: "File not found" });
    }

    return c.json({
      message: "File retrieved successfully",
      data: file
    });
  } catch (error) {
    console.error("Fetch file error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// Update a file
app.put("/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const { name, path, size, type } = await c.req.json();
    
    const updatedFile = await prisma.file.update({
      where: { id },
      data: {
        name,
        path,
        size,
        type,
      }
    });

    return c.json({
      message: "File updated successfully",
      data: updatedFile
    });
  } catch (error) {
    console.error("File update error:", error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
});

// Delete a file
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    await prisma.file.delete({
      where: { id }
    });

    return c.json({
      message: "File deleted successfully"
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