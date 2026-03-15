import { buildRoute } from "@/main/adapters";
import { workOrderResponseSchema } from "@/main/docs";
import {
  makeApproveWorkOrderController,
  makeCancelWorkOrderController,
  makeCreateWorkOrderController,
  makeDeleteWorkOrderController,
  makeGetAllWorkOrdersController,
  makeGetWorkOrderByIdController,
  makeUpdateWorkOrderController,
} from "@/main/factories/controllers";
import {
  authMiddleware,
  customerOrUserAuthMiddleware,
} from "@/main/middlewares";
import { FastifyInstance } from "fastify";

export default async function workOrderRoutes(fastify: FastifyInstance) {
  fastify.post(
    "",
    {
      preHandler: authMiddleware,
      schema: {
        summary: "Create Work Order",
        description:
          "Creates a new work order for vehicle repair or maintenance. Work orders track the entire service process from receipt to delivery, including services performed, parts used, and current status.",
        tags: ["work-order"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          description: "Work order creation payload",
          properties: {
            customerId: {
              type: "string",
              description:
                "Unique identifier of the customer requesting the service",
              format: "uuid",
            },
            vehicleId: {
              type: "string",
              description: "Unique identifier of the vehicle to be serviced",
              format: "uuid",
            },
            serviceIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description:
                "Array of service IDs to be performed on the vehicle",
            },
            partAndSupplyIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description:
                "Array of part/supply IDs that will be used (optional)",
            },
            status: {
              type: "string",
              enum: [
                "RECEIVED",
                "IN_DIAGNOSIS",
                "WAITING_APPROVAL",
                "APPROVED",
                "IN_EXECUTION",
                "FINISHED",
                "DELIVERED",
                "CANCELED",
              ],
              default: "RECEIVED",
              description:
                "Initial status of the work order (defaults to RECEIVED)",
            },
          },
          required: ["customerId", "vehicleId"],
        },
        response: {
          201: {
            description: "Work order created successfully",
            ...workOrderResponseSchema,
          },
          400: {
            description: "Bad Request",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          500: {
            description: "Internal Server Error",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    buildRoute(makeCreateWorkOrderController()),
  );
  fastify.get(
    "",
    {
      preHandler: authMiddleware,
      schema: {
        summary: "List Work Orders",
        description:
          "Retrieves a paginated list of all work orders in the system. Supports comprehensive filtering by customer, vehicle, status, and budget range, with multiple sorting options for efficient work order management.",
        tags: ["work-order"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          description:
            "Query parameters for filtering, pagination, and sorting",
          properties: {
            page: {
              type: "number",
              default: 1,
              minimum: 1,
              description: "Page number for pagination",
            },
            limit: {
              type: "number",
              default: 10,
              minimum: 1,
              maximum: 100,
              description: "Number of items per page",
            },
            orderBy: {
              type: "string",
              enum: ["status", "budget", "createdAt"],
              default: "createdAt",
              description: "Field to sort by",
            },
            orderDirection: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
              description: "Sort direction (ascending or descending)",
            },
            customerId: {
              type: "string",
              description:
                "Filter by customer ID to show only their work orders",
            },
            vehicleId: {
              type: "string",
              description:
                "Filter by vehicle ID to show only work orders for that vehicle",
            },
            status: {
              type: "string",
              enum: [
                "RECEIVED",
                "IN_DIAGNOSIS",
                "WAITING_APPROVAL",
                "APPROVED",
                "IN_EXECUTION",
                "FINISHED",
                "DELIVERED",
                "CANCELED",
              ],
              description: "Filter by work order status",
            },
            minBudget: {
              type: "number",
              minimum: 0,
              description: "Filter by minimum budget amount",
            },
            maxBudget: {
              type: "number",
              minimum: 0,
              description: "Filter by maximum budget amount",
            },
          },
        },
        response: {
          200: {
            description: "List of all work orders",
            type: "object",
            properties: {
              page: { type: "number" },
              limit: { type: "number" },
              total: { type: "number" },
              totalPages: { type: "number" },
              content: {
                type: "array",
                items: workOrderResponseSchema,
              },
            },
          },
          500: {
            description: "Internal Server Error",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    buildRoute(makeGetAllWorkOrdersController()),
  );
  fastify.get(
    "/:id",
    {
      preHandler: customerOrUserAuthMiddleware,
      schema: {
        summary: "Get Work Order by ID",
        description:
          "Retrieves complete details of a specific work order including all associated services, parts/supplies, customer information, vehicle details, current status, and budget calculations.",
        tags: ["work-order"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          description: "Path parameters",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier of the work order",
              format: "uuid",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Work order retrieved successfully",
            ...workOrderResponseSchema,
          },
          400: {
            description: "Bad Request",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            description: "Not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          500: {
            description: "Internal Server Error",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    buildRoute(makeGetWorkOrderByIdController()),
  );
  fastify.patch(
    "/:id",
    {
      preHandler: authMiddleware,
      schema: {
        summary: "Update Work Order",
        description:
          "Updates an existing work order. Commonly used to modify services, add/remove parts and supplies, or change the status as work progresses. Budget is automatically recalculated based on changes.",
        tags: ["work-order"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          description: "Path parameters",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier of the work order to update",
              format: "uuid",
            },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          description: "Work order update payload (all fields optional)",
          properties: {
            serviceIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description:
                "Updated array of service IDs (replaces existing services)",
            },
            partAndSupplyIds: {
              type: "array",
              items: { type: "string", format: "uuid" },
              description:
                "Updated array of part/supply IDs (replaces existing parts)",
            },
            status: {
              type: "string",
              enum: [
                "RECEIVED",
                "IN_DIAGNOSIS",
                "WAITING_APPROVAL",
                "APPROVED",
                "IN_EXECUTION",
                "FINISHED",
                "DELIVERED",
                "CANCELED",
              ],
              description:
                "Updated work order status based on current progress",
            },
          },
        },
        response: {
          200: {
            description: "Work order updated successfully",
            ...workOrderResponseSchema,
          },
          400: {
            description: "Bad Request",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            description: "Work order not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          500: {
            description: "Internal Server Error",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    buildRoute(makeUpdateWorkOrderController()),
  );
  fastify.post(
    "/:id/approve",
    {
      preHandler: customerOrUserAuthMiddleware,
      schema: {
        summary: "Approve Work Order",
        description:
          "Approves a work order that is in WAITING_APPROVAL status, allowing work to proceed. Sends an email notification to the customer informing them of the approval and next steps.",
        tags: ["work-order"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          description: "Path parameters",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier of the work order to approve",
              format: "uuid",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Work order approved successfully",
            ...workOrderResponseSchema,
          },
          400: {
            description: "Bad Request",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            description: "Work order not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          500: {
            description: "Internal Server Error",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    buildRoute(makeApproveWorkOrderController()),
  );
  fastify.post(
    "/:id/cancel",
    {
      preHandler: customerOrUserAuthMiddleware,
      schema: {
        summary: "Cancel Work Order",
        description:
          "Cancels a work order that is in RECEIVED, IN_DIAGNOSIS, WAITING_APPROVAL, APPROVED, or IN_EXECUTION status. Sends an email notification to the customer informing them of the cancellation and any next steps.",
        tags: ["work-order"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          description: "Path parameters",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier of the work order to cancel",
              format: "uuid",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Work order canceled successfully",
            ...workOrderResponseSchema,
          },
          400: {
            description: "Bad Request",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          404: {
            description: "Work order not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          500: {
            description: "Internal Server Error",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    buildRoute(makeCancelWorkOrderController()),
  );
  fastify.delete(
    "/:id",
    {
      preHandler: authMiddleware,
      schema: {
        summary: "Delete Work Order",
        description:
          "Permanently removes a work order from the system. This action cannot be undone and will delete all associated service history and documentation. Consider setting status to CANCELED instead.",
        tags: ["work-order"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          description: "Path parameters",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier of the work order to delete",
              format: "uuid",
            },
          },
          required: ["id"],
        },
        response: {
          204: {
            description: "Work order deleted successfully",
          },
          404: {
            description: "Work order not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
          500: {
            description: "Internal Server Error",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    buildRoute(makeDeleteWorkOrderController()),
  );
}
