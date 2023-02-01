# import requests
import sys
import cv2
import numpy as np

def writePPM(file):
    f = open("images/reference/reference.ppm", "w")
    f.write(file)
    f.close()

def processUserImage(filename):
    ######################### Circle Detection #########################

    #reading in image
    img = cv2.imread('images/uploads/' + filename, cv2.IMREAD_COLOR)

    #creating gray scale version of image needed for HoughCircles
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    #Blurs an image for better edge detection
    #Tested blur, medianBlur, gaussian, and bilateral
    #bilateral produced most accurate outline from test set.
    imgBlur = cv2.bilateralFilter(gray,9,75,75)

    #original(no blur, minDist, or maxDist)
    # detected_circles = cv2.HoughCircles(imgBlur, cv2.HOUGH_GRADIENT, 0.5, 100, param1=420, param2=10)

    #getting height and width of image
    height = img.shape[0]
    width = img.shape[1]

    #setting max_r so its half the length of the longest direction
    max_r = int(height/2)
    if(height < width):
        max_r = int(width/2)

    #get rid of mini circles
    min_r = int(width/4)
    if(height > width):
        min_r = int(height/4)

    detected_circles = cv2.HoughCircles(imgBlur, cv2.HOUGH_GRADIENT, 0.5, 100, param1= 420, param2=10, minRadius=min_r, maxRadius=max_r)

    #used to detect moon outline
    x, y, radius = (0,0,0)

    #HoughCircles(image, method, dp, minDist, maxDist, param1, param2)
    #cv2.HOUGH_GRADIENT is the only method available at the time is hough circles
    #dp is the inverse ratio of the accumulator resolution to the image resolution.
    #minDist is the minimum distance between the centers of the detected circles
    #maxDist is the maximum distance between the centers of the detected circles
    #parm1 is the higher threshold of the two passed to the Canny edge detector
    #parm2 is the accumulator threshold for the circle centers at the detection stage

    #checks for circles then finds biggest circle with HoughCircle parameters
    if detected_circles is not None:
        detection_circles = np.uint16(np.around(detected_circles))
        for (xc, yc, rc) in detection_circles[0, :]:
            if(rc > radius):
                x = int(xc)
                y = int(yc)
                radius = int(rc)
    else:
        print("circle not detected")

    #original got the first circle from the list and set it to the x,y,r
    # if detected_circles is not None:
    #     detected_circles = np.uint16(np.around(detected_circles))
    #     x, y, radius = int(detected_circles[0][0][0]), int(detected_circles[0][0][1]), int(
    #         detected_circles[0][0][2])
    #     center = (x, y)
    # else:
    #     print("circle not detected")


    ######################### crop image #########################
    #add 15 pixels of padding to get rid of weird cropping of images
    yStart = y - radius - 15
    if (yStart < 0):
        yStart = 0

    yEnd = y + radius + 15
    if (yEnd > height):
        yEnd = height

    xStart = x - radius - 15
    if (xStart < 0):
        xStart = 0

    xEnd = x + radius + 15
    if (xEnd > width):
        xEnd = width

    croppedImg = img[yStart:yEnd, xStart:xEnd]

    # add pixels to the image
    top = y - radius
    if (top >= 0):
        top = 0
    if (top < 0):
        top = - (top)

    bottom = y + radius
    if (bottom <= height):
        bottom = 0
    if (bottom > height):
        bottom = (bottom - height)

    left = x - radius
    if (left >= 0):
        left = 0
    if (left < 0):
        left = -(left)

    right = x + radius
    if (right <= width):
        right = 0
    if (right > width):
        right = right - width

    newImg = cv2.copyMakeBorder(croppedImg, top, bottom, left, right, cv2.BORDER_CONSTANT)

    
    ######################### Globe Map #########################
    # Produce a downsampled version of Globe Map
    #Choosing picture from global sample based on the width of the newImage picture
    #Later will be replaced with image from 3D standpoint
    ppd = round(newImg.shape[1] / 360)
    if (ppd <= 5):
        map = cv2.imread('image-registration/globe_all/05_LRO_ref.jpg')

    if (ppd <= 7):
        map = cv2.imread('image-registration/globe_all/07_LRO_ref.jpg')

    if (ppd <= 10):
        map = cv2.imread('image-registration/globe_all/10_LRO_ref.jpg')

    if (ppd <= 15):
        map = cv2.imread('image-registration/globe_all/15_LRO_ref.jpg')

    if (ppd <= 20):
        map = cv2.imread('image-registration/globe_all/20_LRO_ref.jpg')
    # resize the map
    newMap = cv2.resize(map, (newImg.shape[1], newImg.shape[0]))

    print("H and W for new map", newImg.shape[0], newImg.shape[1])

    print("shape of new map", newMap.shape)

    ######################### Scale-Invariant Feature Transform #########################
    # image regestration features matching (SIFT)

    #cropped image to black and white
    imgG = cv2.cvtColor(newImg, cv2.COLOR_BGR2GRAY)
    imgGray = cv2.bilateralFilter(imgG,9,75,75)

    #globe image to black and white
    newMapG = cv2.cvtColor(newMap, cv2.COLOR_BGR2GRAY)
    newMapGray = cv2.bilateralFilter(newMapG,9,75,75)

    #creating SIFT
    sift = cv2.xfeatures2d.SIFT_create()

    keypoints1, descriptors1 = sift.detectAndCompute(imgGray, None)
    keypoints2, descriptors2 = sift.detectAndCompute(newMapGray, None)
    
    #creating BFMatcher
    bf = cv2.BFMatcher()

    #find the keypoints and descriptors with SIFT
    matches = bf.knnMatch(descriptors1, descriptors2, k=2)
    good_matches = []

    #apply ratio test
    for m, n in matches:
        if m.distance < 0.75 * n.distance:
            good_matches.append([m])
    imMatches = cv2.drawMatchesKnn(newImg, keypoints1, newMap, keypoints2, good_matches, None,
                                    flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)
    # cv2_imshow(imMatches)

    # cv2.waitKey(1)

    result = cv2.imwrite(
        'images/processed/registration-' + filename, imMatches)
    if result == True:
        print("File saved successfully")
    else:
        print("Error in saving file")

    user_to_globe_root = 'processed/globe-' + filename

    #Warp image section
    # image regestration SIFT
    ref_matched_kpts = np.float32([keypoints1[m[0].queryIdx].pt for m in good_matches])
    sensed_matched_kpts = np.float32([keypoints2[m[0].trainIdx].pt for m in good_matches])

    #Compute homography
    H, status = cv2.findHomography(ref_matched_kpts, sensed_matched_kpts, cv2.RANSAC, 5.0)

    #Warp image
    imgAfterRegistration = cv2.warpPerspective(newImg, H, (newMapGray.shape[0], newMapGray.shape[1]))

    # save processed image
    result = cv2.imwrite(
        'images/processed/resized-' + filename, imgAfterRegistration)
    if result == True:
        print("File saved successfully")
    else:
        print("Error in saving file")

    # cv2.waitKey(1)

    # image_processed_root = 'user_images_processed/processed.jpg'

    # roots= [image_processed_root , user_to_globe_root]
    # # some code here to process the WAC to be able to be used later in our 3D model
    # # what needs to be processed is to cut it in the edges
    # # once is cut and processed save the image in the folder static/WAC_resized/
    # # map_resize()

    # return roots

if __name__ == "__main__":
    
    processUserImage(sys.argv[1])