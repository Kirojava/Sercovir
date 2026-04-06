import { Router, type IRouter } from "express";
import healthRouter from "./health";
import countriesRouter from "./countries";
import conflictsRouter from "./conflicts";
import committeesRouter from "./committees";
import resolutionsRouter from "./resolutions";
import alliancesRouter from "./alliances";
import intelligenceRouter from "./intelligence";
import delegatesRouter from "./delegates";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(countriesRouter);
router.use(conflictsRouter);
router.use(committeesRouter);
router.use(resolutionsRouter);
router.use(alliancesRouter);
router.use(intelligenceRouter);
router.use(delegatesRouter);
router.use(dashboardRouter);

export default router;
