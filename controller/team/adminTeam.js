import express from "express";
import { requireSignin, isAdmin } from "../../middleware/authMiddleware.js";
import {
  getAllTeams,
  getTeamById,
  getTeamMembers,
  getTeamStatistics,
  verifyTeam,
  suspendTeam,
  reactivateTeam,
  updateTeamTier,
  removeTeamMember,
  addTeamMember,
  updateTeam,
  deleteTeam,
  getAllTeamMembers,
  createTeamMember,
  setTeamSponsor,
  deleteTeamMember,
  updateTeamMember,
} from "./adminTeamController.js";
import { getDownlineStructure } from "./teamController.js";

const router = express.Router();

// ==================== ADMIN TEAM MANAGEMENT ROUTES ====================
// All routes require authentication and admin role - apply middleware to each route individually

// Team List & Statistics
router.get("/admin/team/list", requireSignin, isAdmin, getAllTeams);
router.get("/admin/team/statistics", requireSignin, isAdmin, getTeamStatistics);

// Single Team Operations - More specific routes FIRST
router.get("/admin/team/:teamId", requireSignin, isAdmin, getTeamById);
router.put("/admin/team/:teamId", requireSignin, isAdmin, updateTeam);
router.delete("/admin/team/:teamId", requireSignin, isAdmin, deleteTeam);

// Team Verification
router.post("/admin/team/:teamId/verify", requireSignin, isAdmin, verifyTeam);
router.post("/admin/team/:teamId/suspend", requireSignin, isAdmin, suspendTeam);
router.post("/admin/team/:teamId/reactivate", requireSignin, isAdmin, reactivateTeam);

// Team Tier Management
router.put("/admin/team/:teamId/tier", requireSignin, isAdmin, updateTeamTier);

// Team Members Management
router.get("/admin/team/:teamId/members", requireSignin, isAdmin, getTeamMembers);
router.post("/admin/team/:teamId/members", requireSignin, isAdmin, addTeamMember);
router.delete("/admin/team/:teamId/members/:memberId", requireSignin, isAdmin, removeTeamMember);

// ==================== ADMIN TEAM MEMBER ROUTES ====================

// Get all team members (global)
router.get("/admin/team-members/list", requireSignin, isAdmin, async (req, res) => {
  try {
    const result = await getAllTeamMembers();
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create team member
router.post("/admin/team-members/create", requireSignin, isAdmin, async (req, res) => {
  try {
    const { userId, sponsorId, packagePrice } = req.body;
    const result = await createTeamMember(userId, sponsorId, packagePrice);
    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Set sponsor for team member
router.post("/admin/team-members/set-sponsor", requireSignin, isAdmin, async (req, res) => {
  try {
    const { userId, sponsorId } = req.body;
    const result = await setTeamSponsor(userId, sponsorId);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update team member
router.put("/admin/team-members/:userId", requireSignin, isAdmin, async (req, res) => {
  try {
    const { packagePrice } = req.body;
    const result = await updateTeamMember(req.params.userId, packagePrice);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete team member
router.delete("/admin/team-members/:userId", requireSignin, isAdmin, async (req, res) => {
  try {
    const result = await deleteTeamMember(req.params.userId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN HIERARCHY ROUTES ====================

// Get downline structure for any user (admin only)
router.get("/admin/team/downline-structure/:userId", requireSignin, isAdmin, async (req, res) => {
  try {
    const depth = parseInt(req.query.depth) || 10;
    console.log(`[ADMIN] Fetching downline structure for userId: ${req.params.userId}, depth: ${depth}`);
    const result = await getDownlineStructure(req.params.userId, depth);
    console.log(`[ADMIN] Downline structure result:`, result.success ? 'SUCCESS' : 'FAILED');
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error('[ADMIN] Error fetching downline structure:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
