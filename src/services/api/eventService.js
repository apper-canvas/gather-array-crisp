class EventService {
  constructor() {
    this.tableName = 'event_c';
    this.apperClient = null;
  }

  getApperClient() {
    if (!this.apperClient && window.apperClient) {
      this.apperClient = window.apperClient;
    }
    return this.apperClient;
  }

  async getAll() {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "start_time_c"}},
          {"field": {"Name": "end_time_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "capacity_c"}},
          {"field": {"Name": "organizer_id_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "is_featured_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI format
      return (response.data || []).map(event => ({
        Id: event.Id,
        title: event.title_c || event.Name || '',
        description: event.description_c || '',
        category: event.category_c || '',
        date: event.date_c || '',
        startTime: event.start_time_c || '',
        endTime: event.end_time_c || '',
        location: event.location_c || '',
        capacity: event.capacity_c || 0,
        organizerId: event.organizer_id_c || '',
        imageUrl: event.image_url_c || '',
        isFeatured: event.is_featured_c || false,
        createdAt: event.CreatedOn,
        updatedAt: event.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "start_time_c"}},
          {"field": {"Name": "end_time_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "capacity_c"}},
          {"field": {"Name": "organizer_id_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "is_featured_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await client.getRecordById(this.tableName, id, params);
      
      if (!response.success || !response.data) {
        throw new Error("Event not found");
      }

      const event = response.data;
      // Transform database fields to UI format
      return {
        Id: event.Id,
        title: event.title_c || event.Name || '',
        description: event.description_c || '',
        category: event.category_c || '',
        date: event.date_c || '',
        startTime: event.start_time_c || '',
        endTime: event.end_time_c || '',
        location: event.location_c || '',
        capacity: event.capacity_c || 0,
        organizerId: event.organizer_id_c || '',
        imageUrl: event.image_url_c || '',
        isFeatured: event.is_featured_c || false,
        createdAt: event.CreatedOn,
        updatedAt: event.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  }

  async create(eventData) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      // Transform UI format to database fields (only Updateable fields)
      const params = {
        records: [
          {
            Name: eventData.title || '',
            title_c: eventData.title || '',
            description_c: eventData.description || '',
            category_c: eventData.category || '',
            date_c: eventData.date || '',
            start_time_c: eventData.startTime || '',
            end_time_c: eventData.endTime || '',
            location_c: eventData.location || '',
            capacity_c: parseInt(eventData.capacity) || 0,
            organizer_id_c: eventData.organizerId || '',
            image_url_c: eventData.imageUrl || '',
            is_featured_c: eventData.isFeatured || false
          }
        ]
      };

      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          throw new Error(result.message || "Failed to create event");
        }
        
        // Transform back to UI format
        const event = result.data;
        return {
          Id: event.Id,
          title: event.title_c || event.Name || '',
          description: event.description_c || '',
          category: event.category_c || '',
          date: event.date_c || '',
          startTime: event.start_time_c || '',
          endTime: event.end_time_c || '',
          location: event.location_c || '',
          capacity: event.capacity_c || 0,
          organizerId: event.organizer_id_c || '',
          imageUrl: event.image_url_c || '',
          isFeatured: event.is_featured_c || false,
          createdAt: event.CreatedOn,
          updatedAt: event.ModifiedOn
        };
      }
      
      throw new Error("No data returned from create operation");
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async update(id, eventData) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      // Transform UI format to database fields (only Updateable fields)
      const updateData = {
        Id: id
      };

      if (eventData.title !== undefined) {
        updateData.Name = eventData.title;
        updateData.title_c = eventData.title;
      }
      if (eventData.description !== undefined) updateData.description_c = eventData.description;
      if (eventData.category !== undefined) updateData.category_c = eventData.category;
      if (eventData.date !== undefined) updateData.date_c = eventData.date;
      if (eventData.startTime !== undefined) updateData.start_time_c = eventData.startTime;
      if (eventData.endTime !== undefined) updateData.end_time_c = eventData.endTime;
      if (eventData.location !== undefined) updateData.location_c = eventData.location;
      if (eventData.capacity !== undefined) updateData.capacity_c = parseInt(eventData.capacity) || 0;
      if (eventData.organizerId !== undefined) updateData.organizer_id_c = eventData.organizerId;
      if (eventData.imageUrl !== undefined) updateData.image_url_c = eventData.imageUrl;
      if (eventData.isFeatured !== undefined) updateData.is_featured_c = eventData.isFeatured;

      const params = {
        records: [updateData]
      };

      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          throw new Error(result.message || "Failed to update event");
        }
        
        // Transform back to UI format
        const event = result.data;
        return {
          Id: event.Id,
          title: event.title_c || event.Name || '',
          description: event.description_c || '',
          category: event.category_c || '',
          date: event.date_c || '',
          startTime: event.start_time_c || '',
          endTime: event.end_time_c || '',
          location: event.location_c || '',
          capacity: event.capacity_c || 0,
          organizerId: event.organizer_id_c || '',
          imageUrl: event.image_url_c || '',
          isFeatured: event.is_featured_c || false,
          createdAt: event.CreatedOn,
          updatedAt: event.ModifiedOn
        };
      }
      
      throw new Error("No data returned from update operation");
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [id]
      };

      const response = await client.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (!result.success) {
          throw new Error(result.message || "Failed to delete event");
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }
}

export const eventService = new EventService();