package cm4108.coursework.location.resource;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;

import cm4108.aws.util.DynamoDBUtil;
import cm4108.coursework.config.LocationConfig;
import cm4108.coursework.location.model.Location;

@Path("/location")
public class LocationResource {
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response addLocation(@FormParam("id") String id,@FormParam("longitude") double longitude,@FormParam("latitude") double latitude) {
		try {
			//Create new location from params
			Location location = new Location(id,longitude,latitude);
			//Save new location
			DynamoDBMapper mapper = DynamoDBUtil.getDBMapper(LocationConfig.REGION, LocationConfig.LOCAL_ENDPOINT);
			mapper.save(location);
			return Response.status(201).entity("Location Saved").build();
		} catch (Exception e) {
			//Error
			return Response.status(400).entity("Error in saving location").build();
		}
	}
	
	@Path("/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Location getOneLocation(@PathParam("id") String id) {
		//Load location
		DynamoDBMapper mapper = DynamoDBUtil.getDBMapper(LocationConfig.REGION, LocationConfig.LOCAL_ENDPOINT);
		Location location = mapper.load(Location.class, id);
		//If null throw not found error
		if (location == null) {
			throw new WebApplicationException(404);
		}
		return location;
	}
}
