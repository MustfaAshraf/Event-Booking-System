import Event from '../../DB/models/event.model.js';
import { EVENT_STATUS, USER_ROLES } from '../../config/constants.js';
import { config } from '../../config/env.js';
import { ApiFeatures } from '../../utils/apiFeatures.js';

export type EventListQuery = Record<string, string | undefined>;

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