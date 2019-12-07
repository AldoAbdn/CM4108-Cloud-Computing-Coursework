package cm4108.coursework.request.resource;

import java.util.Collection;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;

import cm4108.aws.util.DynamoDBUtil;
import cm4108.coursework.config.RequestConfig;
import cm4108.coursework.request.model.Request;

@Path("/request")
public class RequestResource {
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response addRequest(@FormParam("requesterID") String requesterID, @FormParam("recipientID") String recipientID) {
		try {
			//Create new request from params
			Request request = new Request(requesterID,recipientID);
			//Try and save in DB
			DynamoDBMapper mapper = DynamoDBUtil.getDBMapper(RequestConfig.REGION, RequestConfig.LOCAL_ENDPOINT);
			mapper.save(request);
			return Response.status(201).entity("Request Saved").build();
		} catch (Exception e) {
			//Error
			return Response.status(400).entity("Error in saving Request").build();
		}
	}
	
	@Path("/{recipientID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Request> getRequests(@PathParam("recipientID") String recipientID){
		//Query table for all requests with this recipientID
		DynamoDBMapper mapper = DynamoDBUtil.getDBMapper(RequestConfig.REGION, RequestConfig.LOCAL_ENDPOINT);
		Map<String,AttributeValue> eav = new HashMap<String,AttributeValue>();
		eav.put(":val1", new AttributeValue().withS(recipientID));
		DynamoDBQueryExpression<Request> queryExpression = new DynamoDBQueryExpression<Request>().withKeyConditionExpression("recipientID = :val1").
				withExpressionAttributeValues(eav);
		Collection<Request> requests = mapper.query(Request.class, queryExpression);
		//If nothing returned throw not found error
		if (requests==null) 
			throw new WebApplicationException(404);
		return requests;
	}
	
	@Path("/{recipientID}")
	@DELETE
	public Response deleteOneRequest(@PathParam("recipientID") String recipientID, @QueryParam("requesterID") String requesterID) {
		//Load request from db
		DynamoDBMapper mapper = DynamoDBUtil.getDBMapper(RequestConfig.REGION,  RequestConfig.LOCAL_ENDPOINT);
		Request response = mapper.load(Request.class,recipientID,requesterID);
		//If null throw not found error
		if (response==null)
			throw new WebApplicationException(404);
		//Delete
		mapper.delete(response);
		return Response.status(200).entity("Request Deleted").build();
	}
}
