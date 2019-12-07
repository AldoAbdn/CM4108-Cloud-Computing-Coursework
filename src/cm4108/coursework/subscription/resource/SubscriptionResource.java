package cm4108.coursework.subscription.resource;

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
import cm4108.coursework.config.SubscriptionConfig;
import cm4108.coursework.subscription.model.Subscription;

@Path("/subscription")
public class SubscriptionResource {
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response addSubscription(@FormParam("subscriberID") String subscriberID, @FormParam("subscriptionID") String subscriptionID) {
		try {
			//Create new subscription from params
			Subscription subscription = new Subscription(subscriberID, subscriptionID);
			//Save subscription
			DynamoDBMapper mapper = DynamoDBUtil.getDBMapper(SubscriptionConfig.REGION, SubscriptionConfig.LOCAL_ENDPOINT);
			mapper.save(subscription);
			return Response.status(201).entity("Subscription Saved").build();
		} catch (Exception e) {
			//Error
			return Response.status(400).entity("Error in saving Subscription").build();
		}
	}
	
	@Path("/{subscriberID}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Subscription> getSubscriptions(@PathParam("subscriberID") String subscriberID){
		//Query db for any subscriptions with subscriberID
		DynamoDBMapper mapper = DynamoDBUtil.getDBMapper(SubscriptionConfig.REGION, SubscriptionConfig.LOCAL_ENDPOINT);
		Map<String,AttributeValue> eav = new HashMap<String,AttributeValue>();
		eav.put(":val1", new AttributeValue().withS(subscriberID));
		DynamoDBQueryExpression<Subscription> queryExpression = new DynamoDBQueryExpression<Subscription>().withKeyConditionExpression("subscriberID = :val1").withExpressionAttributeValues(eav);
		Collection<Subscription> subscriptions = mapper.query(Subscription.class, queryExpression);
		//If null return throw not found
		if (subscriptions==null)
			throw new WebApplicationException(404);
		return subscriptions;
	}
	
	@Path("/{subscriberID}")
	@DELETE
	public Response deleteOneSubscription(@PathParam("subscriberID") String subscriberID, @QueryParam("subscriptionID") String subscriptionID) {
		//Load subscription from db
		DynamoDBMapper mapper = DynamoDBUtil.getDBMapper(SubscriptionConfig.REGION, SubscriptionConfig.LOCAL_ENDPOINT);
		Subscription subscription = mapper.load(Subscription.class,subscriberID,subscriptionID);
		//If null throw not found
		if (subscription==null)
			throw new WebApplicationException(404);
		//Delete
		mapper.delete(subscription);
		return Response.status(200).entity("Subscription Deleted").build();
	}
}
