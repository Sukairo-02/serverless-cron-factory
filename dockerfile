FROM oven/bun as builder

LABEL fly_launch_runtime="Bun"

COPY . /node
WORKDIR /node 

ENV NODE_ENV "production"
ENV PORT "8080"

EXPOSE ${PORT}

CMD [ "bun", "run", "start" ]
