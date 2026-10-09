import Event from '../../DB/models/event.model.js';
import Booking from '../../DB/models/booking.model.js';
import {
    BOOKING_STATUS,
    EVENT_STATUS,
    USER_ROLES
} from '../../config/constants.js';
import { config } from '../../config/env.js';
import { ApiFeatures } from '../../utils/apiFeatures.js';
import {
    createBadRequestError,
    createConflictError,
    createForbiddenError,
    createNotFoundError
} from '../../utils/appError.js';

export type EventListQuery = Record<string, string | undefined>;

export type EventInput = {
    title: string;
    description: string;
    category: string;
    location: string;
    startDate: string | Date;
    capacity: number;
    price: number;
    status?: string;
};

export type EventUpdates = Partial<EventInput> & {
    status?: typeof EVENT_STATUS.DRAFT | typeof EVENT_STATUS.PUBLISHED;
};

const canViewUnpublishedEvents = (role?: string): boolean =>
    role === USER_ROLES.ORGANIZER || role === USER_ROLES.ADMIN;

const findEventOrThrow = async (eventId: string) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw createNotFoundError('Event not found.');
    }
    return event;
};

const ensureEventManager = (
    event: { organizer: { toString: () => string } },
    userId: string,
    role: string
): void => {
    if (role !== USER_ROLES.ADMIN && event.organizer.toString() !== userId) {
        throw createForbiddenError('You can only manage your own events.');
    }
};

export const listEventsService = async (
    queryString: EventListQuery,
    viewerRole?: string
) => {
    const page = Number(queryString.page) || 1;
    const limit = Math.min(
        Number(queryString.limit) || config.PAGINATION.DEFAULT_PAGE_SIZE,
        config.PAGINATION.MAX_PAGE_SIZE
    );

    const filters: EventListQuery = { ...queryString };

    if (viewerRole !== USER_ROLES.ORGANIZER && viewerRole !== USER_ROLES.ADMIN) {
        filters.status = EVENT_STATUS.PUBLISHED;
    }

    const features = new ApiFeatures(Event.find(), filters)
        .filter()
        .search()
        .sort()
        .limitFields()
        .paginate();

    const query = features.getQuery();
    const [events, total] = await Promise.all([
        query.lean().exec(),
        Event.countDocuments(query.getFilter()).exec()
    ]);

    return {
        events: events.map(event => ({
            ...event,
            remainingSeats: Math.max(0, event.capacity - event.bookedSeats)
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const getEventService = async (eventId: string, viewerRole?: string) => {
    const event = await Event.findById(eventId).lean().exec();
    if (
        !event ||
        (event.status !== EVENT_STATUS.PUBLISHED &&
            !canViewUnpublishedEvents(viewerRole))
    ) {
        throw createNotFoundError('Event not found.');
    }

    return {
        ...event,
        remainingSeats: Math.max(0, event.capacity - event.bookedSeats)
    };
};

export const createEventService = async (
    eventData: EventInput,
    organizerId: string
) => Event.create({ ...eventData, organizer: organizerId });

export const updateEventService = async (
    eventId: string,
    eventData: EventUpdates,
    userId: string,
    role: string
) => {
    const event = await findEventOrThrow(eventId);
    ensureEventManager(event, userId, role);

    const updatedEvent = await Event.findOneAndUpdate(
        {
            _id: eventId,
            $expr: {
                $lte: ['$bookedSeats', eventData.capacity ?? event.capacity]
            }
        },
        { $set: eventData },
        { new: true, runValidators: true }
    );

    if (!updatedEvent) {
        throw createConflictError(
            'Event capacity cannot be lower than the number of booked seats.'
        );
    }

    return updatedEvent;
};

export const deleteEventService = async (
    eventId: string,
    userId: string,
    role: string
) => {
    const event = await findEventOrThrow(eventId);
    ensureEventManager(event, userId, role);

    const cancelledEvent = await Event.findOneAndUpdate(
        { _id: eventId },
        { $set: { status: EVENT_STATUS.CANCELLED } },
        { new: true }
    );
    if (!cancelledEvent) {
        throw createNotFoundError('Event not found.');
    }

    const [bookingCount] = await Promise.all([
        Booking.countDocuments({ event: eventId }).exec()
    ]);

    if (bookingCount === 0 && cancelledEvent.bookedSeats === 0) {
        await Event.deleteOne({ _id: eventId, status: EVENT_STATUS.CANCELLED }).exec();
        return { deleted: true, cancelled: false };
    }

    await Booking.updateMany(
        { event: eventId, status: BOOKING_STATUS.ACTIVE },
        { $set: { status: BOOKING_STATUS.CANCELLED } }
    ).exec();
    await Event.updateOne(
        { _id: eventId },
        { $set: { bookedSeats: 0 } }
    ).exec();

    return { deleted: false, cancelled: true };
};

export const getEventBookingsService = async (
    eventId: string,
    userId: string,
    role: string
) => {
    const event = await findEventOrThrow(eventId);
    ensureEventManager(event, userId, role);

    return Booking.find({ event: eventId })
        .sort('-createdAt')
        .lean()
        .exec();
};
