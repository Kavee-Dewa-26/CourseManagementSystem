"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("@shared/firebase");
const logger_1 = require("@shared/logger");
const config_1 = require("./config");
async function start() {
    (0, firebase_1.initFirebaseAdmin)();
    // Dynamic import ensures container.ts (and getFirestore()) runs after initFirebaseAdmin()
    const { app } = await Promise.resolve().then(() => __importStar(require('./app')));
    app.listen(config_1.config.port, () => {
        logger_1.logger.info({ port: config_1.config.port }, `${config_1.config.serviceName} listening`);
    });
}
start().catch((err) => {
    process.stderr.write(`Fatal startup error: ${String(err)}\n`);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQzovVXNlcnMvQXN1cy9EZXNrdG9wL0NNUy9wYWNrYWdlcy91c2VyLXNlcnZpY2Uvc3JjL3NlcnZlci50cyIsInNvdXJjZXMiOlsiQzovVXNlcnMvQXN1cy9EZXNrdG9wL0NNUy9wYWNrYWdlcy91c2VyLXNlcnZpY2Uvc3JjL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFxRDtBQUNyRCwyQ0FBbUQ7QUFDbkQscUNBQTZDO0FBRTdDLEtBQUssVUFBVSxLQUFLO0lBQ2xCLElBQUEsNEJBQWlCLEdBQUUsQ0FBQztJQUVwQiwwRkFBMEY7SUFDMUYsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLHdEQUFhLE9BQU8sR0FBQyxDQUFDO0lBRXRDLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7UUFDM0IsZUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxlQUFNLENBQUMsV0FBVyxZQUFZLENBQUMsQ0FBQztJQUN4RSxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFZLEVBQUUsRUFBRTtJQUM3QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW5pdEZpcmViYXNlQWRtaW4gfSBmcm9tICdAc2hhcmVkL2ZpcmViYXNlJztcbmltcG9ydCB7IGxvZ2dlciB9ICAgICAgICAgICAgZnJvbSAnQHNoYXJlZC9sb2dnZXInO1xuaW1wb3J0IHsgY29uZmlnIH0gICAgICAgICAgICBmcm9tICcuL2NvbmZpZyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICBpbml0RmlyZWJhc2VBZG1pbigpO1xuXG4gIC8vIER5bmFtaWMgaW1wb3J0IGVuc3VyZXMgY29udGFpbmVyLnRzIChhbmQgZ2V0RmlyZXN0b3JlKCkpIHJ1bnMgYWZ0ZXIgaW5pdEZpcmViYXNlQWRtaW4oKVxuICBjb25zdCB7IGFwcCB9ID0gYXdhaXQgaW1wb3J0KCcuL2FwcCcpO1xuXG4gIGFwcC5saXN0ZW4oY29uZmlnLnBvcnQsICgpID0+IHtcbiAgICBsb2dnZXIuaW5mbyh7IHBvcnQ6IGNvbmZpZy5wb3J0IH0sIGAke2NvbmZpZy5zZXJ2aWNlTmFtZX0gbGlzdGVuaW5nYCk7XG4gIH0pO1xufVxuXG5zdGFydCgpLmNhdGNoKChlcnI6IHVua25vd24pID0+IHtcbiAgcHJvY2Vzcy5zdGRlcnIud3JpdGUoYEZhdGFsIHN0YXJ0dXAgZXJyb3I6ICR7U3RyaW5nKGVycil9XFxuYCk7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn0pO1xuIl19