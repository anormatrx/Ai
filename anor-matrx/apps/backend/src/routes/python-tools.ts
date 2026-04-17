import { Router } from "express";

const router = Router();

router.post("/api/python-tools/dispatch", async (req, res) => {
  try {
    const decision = req.body?.decision;

    if (!decision?.action) {
      return res.status(400).json({
        ok: false,
        error: "Missing decision.action"
      });
    }

    if (decision.action === "reply") {
      return res.json({
        ok: true,
        mode: "reply",
        content: decision.content || ""
      });
    }

    if (decision.action === "run_python") {
      return res.json({
        ok: true,
        mode: "tool",
        tool: "run_python",
        payload: {
          code: decision.code || ""
        }
      });
    }

    if (decision.action === "install_package") {
      return res.json({
        ok: true,
        mode: "tool",
        tool: "install_package",
        payload: {
          name: decision.name || ""
        }
      });
    }

    if (decision.action === "read_file") {
      return res.json({
        ok: true,
        mode: "tool",
        tool: "read_file",
        payload: {
          path: decision.path || ""
        }
      });
    }

    if (decision.action === "write_file") {
      return res.json({
        ok: true,
        mode: "tool",
        tool: "write_file",
        payload: {
          path: decision.path || "",
          content: decision.content || ""
        }
      });
    }

    return res.status(400).json({
      ok: false,
      error: `Unsupported action: ${decision.action}`
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "Tool dispatch failed"
    });
  }
});

export default router;