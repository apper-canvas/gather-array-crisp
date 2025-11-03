class RegistrationService {
  constructor() {
    this.tableName = 'registration_c';
    this.apperClient = null;
  }

  getApperClient() {
    if (!this.apperClient && window.apperClient) {
      this.apperClient = window.apperClient;
    }
    return this.apperClient;
  }

  async getRegistrationCountForEvent(eventId) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [{"field": {"Name": "Id"}}],
        where: [
          {"FieldName": "event_id_c", "Operator": "EqualTo", "Values": [parseInt(eventId)]},
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": ["confirmed"]}
        ]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return 0;
      }

      return (response.data || []).length;
    } catch (error) {
      console.error("Error getting registration count:", error);
      return 0;
    }
  }

  async getWaitlistCountForEvent(eventId) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [{"field": {"Name": "Id"}}],
        where: [
          {"FieldName": "event_id_c", "Operator": "EqualTo", "Values": [parseInt(eventId)]},
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": ["waitlist"]}
        ]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return 0;
      }

      return (response.data || []).length;
    } catch (error) {
      console.error("Error getting waitlist count:", error);
      return 0;
    }
  }

  async getWaitlistPositionForUser(eventId, userId) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "registered_at_c"}}
        ],
        where: [
          {"FieldName": "event_id_c", "Operator": "EqualTo", "Values": [parseInt(eventId)]},
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": ["waitlist"]}
        ],
        orderBy: [{"fieldName": "registered_at_c", "sorttype": "ASC"}]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const waitlistRegistrations = response.data || [];
      const userRegistration = waitlistRegistrations.find(reg => reg.user_id_c === userId);
      return userRegistration ? waitlistRegistrations.indexOf(userRegistration) + 1 : null;
    } catch (error) {
      console.error("Error getting waitlist position:", error);
      return null;
    }
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
          {"field": {"Name": "event_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "registered_at_c"}},
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
      return (response.data || []).map(registration => ({
        Id: registration.Id,
        eventId: registration.event_id_c?.Id || registration.event_id_c,
        userId: registration.user_id_c || '',
        userEmail: registration.user_email_c || '',
        userName: registration.user_name_c || registration.Name || '',
        status: registration.status_c || 'confirmed',
        registeredAt: registration.registered_at_c || registration.CreatedOn,
        createdAt: registration.CreatedOn,
        updatedAt: registration.ModifiedOn
      }));
    } catch (error) {
      console.error("Error fetching registrations:", error);
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
          {"field": {"Name": "event_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "registered_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await client.getRecordById(this.tableName, id, params);
      
      if (!response.success || !response.data) {
        throw new Error("Registration not found");
      }

      const registration = response.data;
      // Transform database fields to UI format
      return {
        Id: registration.Id,
        eventId: registration.event_id_c?.Id || registration.event_id_c,
        userId: registration.user_id_c || '',
        userEmail: registration.user_email_c || '',
        userName: registration.user_name_c || registration.Name || '',
        status: registration.status_c || 'confirmed',
        registeredAt: registration.registered_at_c || registration.CreatedOn,
        createdAt: registration.CreatedOn,
        updatedAt: registration.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching registration ${id}:`, error);
      throw error;
    }
  }

  async create(registrationData) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      // Check event capacity
      const { eventService } = await import('./eventService.js');
      const event = await eventService.getById(registrationData.eventId);
      const confirmedCount = await this.getRegistrationCountForEvent(registrationData.eventId);
      
      // Determine registration status based on capacity
      const status = confirmedCount >= event.capacity ? "waitlist" : "confirmed";

      // Transform UI format to database fields (only Updateable fields)
      const params = {
        records: [
          {
            Name: registrationData.userName || registrationData.userEmail || 'Registration',
            event_id_c: parseInt(registrationData.eventId),
            user_id_c: registrationData.userId || '',
            user_email_c: registrationData.userEmail || '',
            user_name_c: registrationData.userName || '',
            status_c: status,
            registered_at_c: new Date().toISOString()
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
          throw new Error(result.message || "Failed to create registration");
        }
        
        const registration = result.data;
        
        // Send notification email after successful registration
        if (registrationData.userEmail) {
          try {
            const { ApperClient } = window.ApperSDK || {};
            if (ApperClient) {
              const apperClient = new ApperClient({
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
              });

              const emailData = {
                type: status === 'confirmed' ? 'registration_confirmation' : 'waitlist_confirmation',
                to: registrationData.userEmail,
                data: {
                  userName: registrationData.userName || 'Event Participant',
                  eventTitle: event.title,
                  eventDate: new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }),
                  eventTime: `${event.startTime} - ${event.endTime}`,
                  eventLocation: event.location,
                  status: status,
                  registrationId: registration.Id,
                  eventId: event.Id
                }
              };

              await apperClient.functions.invoke(import.meta.env.VITE_SEND_NOTIFICATION_EMAIL, {
                body: JSON.stringify(emailData),
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            }
          } catch (emailError) {
            console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_SEND_NOTIFICATION_EMAIL}. The error is: ${emailError.message}`);
          }
        }
        
        // Transform back to UI format
        return {
          Id: registration.Id,
          eventId: registration.event_id_c?.Id || registration.event_id_c,
          userId: registration.user_id_c || '',
          userEmail: registration.user_email_c || '',
          userName: registration.user_name_c || registration.Name || '',
          status: registration.status_c || status,
          registeredAt: registration.registered_at_c || registration.CreatedOn,
          createdAt: registration.CreatedOn,
          updatedAt: registration.ModifiedOn
        };
      }
      
      throw new Error("No data returned from create operation");
    } catch (error) {
      console.error("Error creating registration:", error);
      throw error;
    }
  }

  async update(id, registrationData) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      // Get current registration for status comparison
      const currentRegistration = await this.getById(id);

      // Transform UI format to database fields (only Updateable fields)
      const updateData = {
        Id: id
      };

      if (registrationData.eventId !== undefined) updateData.event_id_c = parseInt(registrationData.eventId);
      if (registrationData.userId !== undefined) updateData.user_id_c = registrationData.userId;
      if (registrationData.userEmail !== undefined) updateData.user_email_c = registrationData.userEmail;
      if (registrationData.userName !== undefined) {
        updateData.user_name_c = registrationData.userName;
        updateData.Name = registrationData.userName;
      }
      if (registrationData.status !== undefined) updateData.status_c = registrationData.status;
      if (registrationData.registeredAt !== undefined) updateData.registered_at_c = registrationData.registeredAt;

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
          throw new Error(result.message || "Failed to update registration");
        }
        
        const registration = result.data;
        
        // Send notification if status changed from waitlist to confirmed
        if (currentRegistration.status === 'waitlist' && 
            registrationData.status === 'confirmed' && 
            registration.user_email_c) {
          
          try {
            const { eventService } = await import('./eventService.js');
            const event = await eventService.getById(registration.event_id_c?.Id || registration.event_id_c);
            
            const { ApperClient } = window.ApperSDK || {};
            if (ApperClient) {
              const apperClient = new ApperClient({
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
              });

              const emailData = {
                type: 'registration_confirmation',
                to: registration.user_email_c,
                data: {
                  userName: registration.user_name_c || registration.Name || 'Event Participant',
                  eventTitle: event.title,
                  eventDate: new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }),
                  eventTime: `${event.startTime} - ${event.endTime}`,
                  eventLocation: event.location,
                  status: 'confirmed',
                  registrationId: registration.Id,
                  eventId: event.Id
                }
              };

              await apperClient.functions.invoke(import.meta.env.VITE_SEND_NOTIFICATION_EMAIL, {
                body: JSON.stringify(emailData),
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            }
          } catch (emailError) {
            console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_SEND_NOTIFICATION_EMAIL}. The error is: ${emailError.message}`);
          }
        }
        
        // Transform back to UI format
        return {
          Id: registration.Id,
          eventId: registration.event_id_c?.Id || registration.event_id_c,
          userId: registration.user_id_c || '',
          userEmail: registration.user_email_c || '',
          userName: registration.user_name_c || registration.Name || '',
          status: registration.status_c || 'confirmed',
          registeredAt: registration.registered_at_c || registration.CreatedOn,
          createdAt: registration.CreatedOn,
          updatedAt: registration.ModifiedOn
        };
      }
      
      throw new Error("No data returned from update operation");
    } catch (error) {
      console.error("Error updating registration:", error);
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
          throw new Error(result.message || "Failed to delete registration");
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting registration:", error);
      throw error;
    }
  }

  async getByEventId(eventId) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "event_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "registered_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [
          {"FieldName": "event_id_c", "Operator": "EqualTo", "Values": [parseInt(eventId)]}
        ],
        orderBy: [{"fieldName": "registered_at_c", "sorttype": "ASC"}]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Transform database fields to UI format
      return (response.data || []).map(registration => ({
        Id: registration.Id,
        eventId: registration.event_id_c?.Id || registration.event_id_c,
        userId: registration.user_id_c || '',
        userEmail: registration.user_email_c || '',
        userName: registration.user_name_c || registration.Name || '',
        status: registration.status_c || 'confirmed',
        registeredAt: registration.registered_at_c || registration.CreatedOn,
        createdAt: registration.CreatedOn,
        updatedAt: registration.ModifiedOn
      }));
    } catch (error) {
      console.error(`Error fetching registrations for event ${eventId}:`, error);
      return [];
    }
  }

  async getByUserId(userId) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "event_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "registered_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [
          {"FieldName": "user_id_c", "Operator": "EqualTo", "Values": [userId]}
        ],
        orderBy: [{"fieldName": "registered_at_c", "sorttype": "DESC"}]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      // Transform database fields to UI format
      return (response.data || []).map(registration => ({
        Id: registration.Id,
        eventId: registration.event_id_c?.Id || registration.event_id_c,
        userId: registration.user_id_c || '',
        userEmail: registration.user_email_c || '',
        userName: registration.user_name_c || registration.Name || '',
        status: registration.status_c || 'confirmed',
        registeredAt: registration.registered_at_c || registration.CreatedOn,
        createdAt: registration.CreatedOn,
        updatedAt: registration.ModifiedOn
      }));
    } catch (error) {
      console.error(`Error fetching registrations for user ${userId}:`, error);
      return [];
    }
  }

  async getUserRegistrationForEvent(eventId, userId) {
    try {
      const client = this.getApperClient();
      if (!client) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "event_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "registered_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [
          {"FieldName": "event_id_c", "Operator": "EqualTo", "Values": [parseInt(eventId)]},
          {"FieldName": "user_id_c", "Operator": "EqualTo", "Values": [userId]}
        ]
      };

      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      const registrations = response.data || [];
      if (registrations.length === 0) {
        return null;
      }

      const registration = registrations[0];
      // Transform database fields to UI format
      return {
        Id: registration.Id,
        eventId: registration.event_id_c?.Id || registration.event_id_c,
        userId: registration.user_id_c || '',
        userEmail: registration.user_email_c || '',
        userName: registration.user_name_c || registration.Name || '',
        status: registration.status_c || 'confirmed',
        registeredAt: registration.registered_at_c || registration.CreatedOn,
        createdAt: registration.CreatedOn,
        updatedAt: registration.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching user registration for event ${eventId} and user ${userId}:`, error);
      return null;
    }
  }
}

export const registrationService = new RegistrationService();