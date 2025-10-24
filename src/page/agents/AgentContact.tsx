
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  MessageCircle,
  MapPin,
  Home,
  Shield,
  CheckCircle,
  Clock,
  Eye,
  Bed,
  Bath,
  Square,
  ArrowLeft,
  Star,
  Send
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAgentStore } from "@/stores/agentStore";
import { useAuthStore } from "@/stores/authStore";
import { agentReviewService } from "@/services/reviewService";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


const AgentProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agentProfile, fetchAgentById, loading, error } = useAgentStore();

  const [activeTab, setActiveTab] = useState("properties");
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");


    const [agentRating,setAgentRating] = useState(0)
  const [totalReviews,setTotalReviews] = useState(0)

  const agent = agentProfile?.agent;
  const userInfo = agentProfile?.user;
  const agentProperties = agentProfile?.properties || [];
  const agentStats = agentProfile?.stats;


  // Filter properties by status
  const availableProperties = agentProperties.filter(
    (p) => p.status === "available"
  );
  const rentedProperties = agentProperties.filter((p) => p.status === "rented");
  const pendingProperties = agentProperties.filter(
    (p) => p.status === "pending"
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (agentId) {
          await fetchAgentById(agentId);
           const response = await agentReviewService.getByAgent(agentId);
          if (response.success) {
            setReviews(response.data.reviews || []);
            const roundedRating = Number(response.data.averageRating.toFixed(1)); // 3.2
            setAgentRating(roundedRating);
            setTotalReviews(response.data.totalReviews)
          } else {
            toast.error("Failed to load agent reviews");
          }
        }
      } catch (error) {
        console.error("Failed to load agent data:", error);
        toast.error("Failed to load agent profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [agentId, fetchAgentById]);


    const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  const handleSubmitReview  = async () =>  {

    if (!rating || !comment.trim()) {
      toast.error("Please add a rating and comment before submitting.");
      return;
    }

    const newReview = {
      id: Date.now(),
      reviewerId:{
        name :user?.name
      },
      reviewerImage:user?.avatar,
      rating,
      comment,
      createdAt: new Date().toLocaleDateString(),
    };
     const newRev = {
        agentId: agentId!,
        rating,
        comment,
      };

      
      try{
      const res = await agentReviewService.create(newRev);
      console.log("-------------------------")
      console.log(res)
      setReviews((prev) => [newReview, ...prev]);
      setRating(0);
      setHoverRating(0);
      setComment("");
      toast.success("Review added successfully!");
      return;
      }catch(error){
        console.log(error.message)
        toast.error("Unable to add review")
        return;
      }
      
  };


  const hasReviewed = reviews.some(
  (rev) => rev.reviewerId?._id === user?.id || rev.reviewerId?._id === user?._id
);




  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-8 mx-auto mb-4" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="properties">
            <TabsList className="mb-6 bg-gray-100">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32 ml-2" />
            </TabsList>

            <TabsContent value="properties">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-gray-200">
                    <CardContent className="p-6">
                      <Skeleton className="h-48 w-full mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (error || !agent || !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Agent Not Found</CardTitle>
            <CardDescription className="text-gray-600">
              {error ||
                "The agent you're looking for doesn't exist or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/agents")}
              className="bg-green-600 hover:bg-green-700 text-white">
              Browse Agents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle WhatsApp message
  const handleWhatsAppClick = () => {
    if (!agent.whatsappNumber) {
      toast.error("Agent WhatsApp number not available");
      return;
    }

    const message = `Hello, I'm interested in your properties.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${agent.whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // Calculate agent rating from stats or use mock data


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Agent Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="relative">
            {agent.idPhoto ? (
              <img
                src={agent.idPhoto}
                alt={userInfo.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {agent.verificationStatus === "verified" && (
              <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-1">
                <Shield className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userInfo.name}
                </h1>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {agent.address || "Lagos, Nigeria"}
                </p>

                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(agentRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {agentRating} ({totalReviews} reviews)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleWhatsAppClick}
                  disabled={!agent.whatsappNumber || !user}>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  disabled={!agent.whatsappNumber || !user}>
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <Home className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-900">
                {agentProperties.length}
              </div>
              <div className="text-gray-600">Total Properties</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-900">
                {availableProperties.length}
              </div>
              <div className="text-gray-600">Available</div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-4" />
              <div className="text-2xl font-bold text-gray-900">
                {rentedProperties.length}
              </div>
              <div className="text-gray-600">Rented</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Availability Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Property Status</CardTitle>
              <CardDescription className="text-gray-600">
                Current status of {userInfo.name}'s property portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Available Properties
                  </span>
                  <span className="text-sm text-gray-600">
                    {availableProperties.length} of {agentProperties.length}
                  </span>
                </div>
                <Progress
                  value={
                    agentProperties.length > 0
                      ? (availableProperties.length / agentProperties.length) *
                        100
                      : 0
                  }
                  className="h-2 bg-gray-200"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Rented Properties
                  </span>
                  <span className="text-sm text-gray-600">
                    {rentedProperties.length} of {agentProperties.length}
                  </span>
                </div>
                <Progress
                  value={
                    agentProperties.length > 0
                      ? (rentedProperties.length / agentProperties.length) * 100
                      : 0
                  }
                  className="h-2 bg-gray-200"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Pending Properties
                  </span>
                  <span className="text-sm text-gray-600">
                    {pendingProperties.length} of {agentProperties.length}
                  </span>
                </div>
                <Progress
                  value={
                    agentProperties.length > 0
                      ? (pendingProperties.length / agentProperties.length) *
                        100
                      : 0
                  }
                  className="h-2 bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Agent Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-gray-100">
              <TabsTrigger
                value="properties"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Properties
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                About
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="pt-6">
              {agentProperties.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-gray-900">
                      No Properties Listed
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This agent hasn't listed any properties yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agentProperties.map((property) => (
                    <Card
                      key={property._id}
                      className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
                      <div className="relative h-48 overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Home className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <Badge
                          className={`absolute top-3 left-3 ${
                            property.status === "available"
                              ? "bg-green-500 text-white border-0"
                              : property.status === "rented"
                              ? "bg-orange-500 text-white border-0"
                              : "bg-blue-500 text-white border-0"
                          }`}>
                          {property.status}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1 truncate text-gray-900">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.location}
                        </p>

                        <div className="flex justify-between items-center mb-3">
                          <div className="text-xl font-bold text-green-600">
                            ₦{property.price.toLocaleString()}
                            {property.listingType === "rent" && (
                              <span className="text-sm font-normal text-gray-600">
                                /month
                              </span>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Eye className="h-3 w-3 mr-1" />
                            {property.views || 0}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-gray-700">
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-1" />
                              <span>{property.bedrooms}</span>
                            </div>
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              <span>{property.bathrooms}</span>
                            </div>
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              <span>{property.area}</span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <Link to={`/properties/${property._id}`}>View</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="pt-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    About {userInfo.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {agent.bio ? (
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900">Bio</h4>
                      <p className="text-gray-600">{agent.bio}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600 italic">
                      This agent hasn't provided a bio yet.
                    </p>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">
                      Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">WhatsApp</span>
                        <span className="text-gray-900">
                          {agent.whatsappNumber || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address</span>
                        <span className="text-gray-900">
                          {agent.address || "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email</span>
                        <span className="text-gray-900">
                          {userInfo.email || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900">
                      Verification Status
                    </h4>
                    <Badge
                      className={`capitalize ${
                        agent.verificationStatus === "verified"
                          ? "bg-green-100 text-green-800 border-0"
                          : agent.verificationStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-0"
                          : "bg-red-100 text-red-800 border-0"
                      }`}>
                      {agent.verificationStatus}
                    </Badge>
                    {agent.verificationStatus === "verified" && (
                      <p className="text-sm text-gray-600 mt-2">
                        This agent has been verified by our team. You can trust
                        their listings.
                      </p>
                    )}
                  </div>

                  {agent.createdAt && (
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900">
                        Member Since
                      </h4>
                      <p className="text-gray-600">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>



              <TabsContent value="reviews" className="pt-6">
            <Card className="p-6 space-y-6">
              {user && !hasReviewed &&<form onSubmit={(e) => {
                e.preventDefault();
                handleSubmitReview()
              }}>
                <h4 className="font-semibold text-lg mb-2">Leave a Review</h4>
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const index = i + 1;
                    return (
                      <Star
                        key={index}
                        onClick={() => setRating(index)}
                        onMouseEnter={() => setHoverRating(index)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`h-6 w-6 cursor-pointer ${
                          index <= (hoverRating || rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    );
                  })}
                </div>
                <Textarea
                  placeholder="Write your review..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button
                  type="submit"
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                >
                  Submit Review
                </Button>
              </form>}

              <div>
                <h4 className="font-semibold text-lg mb-4">All Reviews</h4>
                {reviews.length === 0 ? (
                  <p className="text-gray-600 text-sm">No reviews yet.</p>
                ) : (
              <div
                className="space-y-4 max-h-96 overflow-y-auto pr-2"
                style={{ scrollbarWidth: "thin" }} >                    
                     {reviews.map((rev) => (
                      <div key={rev._id || rev.id} className="border-b pb-3">
                        <div className="flex items-center mb-1">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {getInitials(rev.reviewerId.name)}
                            </AvatarFallback>
                            {rev.reviewerImage && (
                              <AvatarImage src={rev.reviewerImage} />
                            )}
                          </Avatar>
                          <span className="font-medium text-gray-900">
                            {rev.reviewerId.name}
                          </span>
                        </div>
                        <div className="flex items-center text-yellow-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm mt-1">{rev.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
              </TabsContent>
          
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentProfile;
